// UAFSAIDA — Enterprise Middleware Stack
// Security headers, rate limiting, request validation, error handling

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

// ═══════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ═══════════════════════════════════════════════════════════════

export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return response;
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITER (In-memory, per-IP)
// ═══════════════════════════════════════════════════════════════

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  request: NextRequest,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const now = Date.now();
  
  const entry = rateLimitStore.get(ip);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

// ═══════════════════════════════════════════════════════════════
// REQUEST VALIDATION
// ═══════════════════════════════════════════════════════════════

export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; errors: any }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return { success: false, errors: result.error.flatten() };
    }
    
    return { success: true, data: result.data };
  } catch {
    return { success: false, errors: { _errors: ['Invalid JSON body'] } };
  }
}

// ═══════════════════════════════════════════════════════════════
// ERROR RESPONSE HELPER
// ═══════════════════════════════════════════════════════════════

export function createErrorResponse(
  error: string,
  code: string,
  status: number,
  details?: unknown
): NextResponse {
  const response = NextResponse.json(
    { error, code, status, details },
    { status }
  );
  return addSecurityHeaders(response);
}

// ═══════════════════════════════════════════════════════════════
// SUCCESS RESPONSE HELPER
// ═══════════════════════════════════════════════════════════════

export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addSecurityHeaders(response);
}

// ═══════════════════════════════════════════════════════════════
// REQUEST LOGGER
// ═══════════════════════════════════════════════════════════════

export function logRequest(request: NextRequest, response: NextResponse, duration: number): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    status: response.status,
    duration: `${duration}ms`,
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging endpoint
    console.log('[API]', JSON.stringify(logEntry));
  } else {
    console.log(`[API] ${logEntry.method} ${logEntry.url} ${logEntry.status} ${logEntry.duration}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// CORS CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://uafsaida.vercel.app',
  process.env.NEXT_PUBLIC_APP_URL || '',
].filter(Boolean);

export function checkCORS(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  
  if (!origin) return null;
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
  
  return null;
}
