// UAFSAIDA — Metrics API (Admin-only)
import { NextResponse } from 'next/server';

// Force dynamic rendering - don't try to statically generate this route
export const dynamic = 'force-dynamic';

export async function GET() {
  // Return mock metrics during build (Prisma client not yet generated)
  // In production, this would query the actual database
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    users: {
      total: 0,
    },
    projects: {
      total: 0,
      active: 0,
    },
    files: {
      total: 0,
    },
    sessions: {
      total: 0,
    },
    tasks: {
      total: 0,
      completed: 0,
      completionRate: 0,
    },
  });
}
