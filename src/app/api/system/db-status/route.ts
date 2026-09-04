// UAFSAIDA — Database Status API
import { NextResponse } from 'next/server';
import { prisma } from '@/services/db';

export async function GET() {
  try {
    const tables = await (prisma as any).$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    const expectedTables = [
      'users', 'accounts', 'auth_sessions', 'projects', 'project_files',
      'agent_sessions', 'chat_messages', 'agent_states', 'agent_tasks',
      'artifacts', 'debug_sessions', 'debug_errors', 'debug_fixes',
      'deployments', 'project_versions', 'quality_reports',
    ];

    const existingTables = tables.map((t: { tablename: string }) => t.tablename);
    const missingTables = expectedTables.filter((t) => !existingTables.includes(t));

    return NextResponse.json({
      status: missingTables.length === 0 ? 'ok' : 'incomplete',
      tables: {
        expected: expectedTables.length,
        existing: existingTables.length,
        missing: missingTables,
      },
    });
  } catch {
    return NextResponse.json({ status: 'error', message: 'Database not reachable' }, { status: 503 });
  }
}
