// UAFSAIDA — Audit Log API
import { NextRequest, NextResponse } from 'next/server';
import { auditLogger, AuditAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const filters = {
    userId: searchParams.get('userId') || undefined,
    action: searchParams.get('action') as AuditAction || undefined,
    resource: searchParams.get('resource') || undefined,
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
  };

  const logs = await auditLogger.getLogs(filters);
  
  return NextResponse.json({
    logs,
    total: logs.length,
    filters,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, resource, details } = body;

    const entry = await auditLogger.log(userId, action, resource, details);
    
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 400 }
    );
  }
}
