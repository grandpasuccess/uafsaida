// UAFSAIDA — Metrics API (Admin-only)
import { NextResponse } from 'next/server';
import { prisma } from '@/services/db';

export async function GET() {
  try {
    const [
      userCount,
      projectCount,
      activeProjects,
      totalFiles,
      totalSessions,
      totalTasks,
      completedTasks,
      deploymentStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({ where: { status: { in: ['generating', 'building', 'testing'] } } }),
      prisma.projectFile.count(),
      prisma.agentSession.count(),
      prisma.agentTask.count(),
      prisma.agentTask.count({ where: { status: 'completed' } }),
      prisma.deployment.groupBy({
        by: ['status'],
        _count: { status: true },
      } as any),
    ]);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      users: {
        total: userCount,
      },
      projects: {
        total: projectCount,
        active: activeProjects,
        byStatus: await prisma.project.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
      },
      files: {
        total: totalFiles,
        totalSize: await prisma.projectFile.aggregate({
          _sum: { size: true },
        }).then((r: any) => r._sum.size || 0),
      },
      sessions: {
        total: totalSessions,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      deployments: {
        byStatus: deploymentStats,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
