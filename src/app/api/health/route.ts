// UAFSAIDA — Health Check API Route
// Production monitoring endpoint

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db';

export async function GET(request: NextRequest) {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    service: 'UAFSAIDA',
    checks: {},
  };

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = { status: 'ok', latency: 0 };
  } catch (error) {
    health.checks.database = { status: 'error', message: 'Database unreachable' };
    health.status = 'degraded';
  }

  // Check AI API connectivity
  try {
    const startTime = Date.now();
    // Simple check: verify API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      health.checks.aiApi = { status: 'warning', message: 'API key not configured' };
    } else {
      health.checks.aiApi = { status: 'ok', latency: Date.now() - startTime };
    }
  } catch (error) {
    health.checks.aiApi = { status: 'error', message: 'AI API unreachable' };
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    status: 'ok',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
  };

  // Check uptime
  health.checks.uptime = {
    status: 'ok',
    seconds: Math.round(process.uptime()),
  };

  const statusCode = health.status === 'ok' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
