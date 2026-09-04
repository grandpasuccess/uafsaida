// UAFSAIDA — Production Database Service Layer
// Real database operations using Prisma (replaces in-memory store)

// Dynamic import to handle Prisma client generation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PrismaClientClass: any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadPrismaClient(): Promise<any> {
  if (PrismaClientClass) return PrismaClientClass;
  
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PrismaModule = require('@prisma/client');
    PrismaClientClass = PrismaModule.PrismaClient || PrismaModule.default?.PrismaClient;
  } catch {
    // Prisma client not generated yet - provide stub
    PrismaClientClass = class {
      constructor() {
        throw new Error('Prisma client not generated. Run: pnpm db:generate');
      }
    };
  }
  
  return PrismaClientClass;
}

// Initialize synchronously for compatibility
loadPrismaClient();

// ═══════════════════════════════════════════════════════════════
// PRISMA CLIENT (singleton)
// ═══════════════════════════════════════════════════════════════

const globalForPrisma = globalThis as unknown as {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma: any;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = globalForPrisma.prisma ?? new PrismaClientClass({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ═══════════════════════════════════════════════════════════════
// PROJECT SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class ProjectService {
  async create(data: {
    name: string;
    description?: string;
    prompt: string;
    type?: string;
    complexity?: string;
    userId: string;
  }) {
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description || '',
        prompt: data.prompt,
        type: data.type || 'custom',
        complexity: data.complexity || 'moderate',
        userId: data.userId,
        status: 'draft',
      },
    });
  }

  async getById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        files: true,
        sessions: {
          include: {
            messages: true,
            tasks: {
              include: { artifacts: true },
            },
            agents: true,
          },
        },
        deployments: true,
        versions: true,
      },
    });
  }

  async getByUser(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        files: { take: 1 },
        _count: { select: { files: true, sessions: true } },
      },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.project.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async delete(id: string) {
    return prisma.project.delete({ where: { id } });
  }

  async updateStatus(id: string, status: string) {
    return prisma.project.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// SESSION SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class SessionService {
  async create(projectId: string, userId: string) {
    return prisma.agentSession.create({
      data: {
        projectId,
        userId,
        status: 'active',
        currentPhase: 'requirement-analysis',
      },
    });
  }

  async getById(id: string) {
    return prisma.agentSession.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { timestamp: 'asc' } },
        tasks: { include: { artifacts: true } },
        agents: true,
      },
    });
  }

  async addMessage(sessionId: string, data: {
    role: string;
    content: string;
    agentRole?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
  }) {
    return prisma.chatMessage.create({
      data: {
        sessionId,
        role: data.role,
        content: data.content,
        agentRole: data.agentRole,
        metadata: data.metadata || {},
      },
    });
  }

  async updatePhase(sessionId: string, phase: string) {
    return prisma.agentSession.update({
      where: { id: sessionId },
      data: { currentPhase: phase, updatedAt: new Date() },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// TASK SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class TaskService {
  async create(data: {
    sessionId: string;
    agentRole: string;
    title: string;
    description: string;
    priority?: string;
    dependencies?: string[];
    estimatedDuration?: number;
  }) {
    return prisma.agentTask.create({
      data: {
        sessionId: data.sessionId,
        agentRole: data.agentRole,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        dependencies: data.dependencies || [],
        estimatedDuration: data.estimatedDuration || 30,
        status: 'pending',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.agentTask.update({
      where: { id },
      data: {
        status,
        startedAt: status === 'in-progress' ? new Date() : undefined,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
    });
  }

  async addArtifact(taskId: string, data: {
    type: string;
    name: string;
    content: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
  }) {
    return prisma.artifact.create({
      data: {
        taskId,
        type: data.type,
        name: data.name,
        content: data.content,
        metadata: data.metadata || {},
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// FILE SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class FileService {
  async create(projectId: string, data: {
    path: string;
    content: string;
    language?: string;
    isGenerated?: boolean;
    generatedBy?: string;
  }) {
    return prisma.projectFile.create({
      data: {
        projectId,
        path: data.path,
        content: data.content,
        language: data.language || 'typescript',
        size: data.content.length,
        isGenerated: data.isGenerated ?? true,
        generatedBy: data.generatedBy,
      },
    });
  }

  async getByProject(projectId: string) {
    return prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { path: 'asc' },
    });
  }

  async update(id: string, content: string) {
    return prisma.projectFile.update({
      where: { id },
      data: {
        content,
        size: content.length,
        isModified: true,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return prisma.projectFile.delete({ where: { id } });
  }
}

// ═══════════════════════════════════════════════════════════════
// DEPLOYMENT SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class DeploymentService {
  async create(data: {
    projectId: string;
    target: string;
    environment?: string;
    domain?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    envVars?: any;
    buildCommand?: string;
    outputDir?: string;
  }) {
    return prisma.deployment.create({
      data: {
        projectId: data.projectId,
        target: data.target,
        environment: data.environment || 'production',
        domain: data.domain,
        envVars: data.envVars || {},
        buildCommand: data.buildCommand,
        outputDir: data.outputDir,
        status: 'pending',
      },
    });
  }

  async updateStatus(id: string, status: string, url?: string) {
    return prisma.deployment.update({
      where: { id },
      data: {
        status,
        url: url || undefined,
        deployedAt: status === 'live' ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async getByProject(projectId: string) {
    return prisma.deployment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// AGENT STATE SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class AgentStateService {
  async upsert(sessionId: string, data: {
    role: string;
    name: string;
    status?: string;
    progress?: number;
    currentTask?: string;
  }) {
    return prisma.agentState.upsert({
      where: {
        sessionId_role: {
          sessionId,
          role: data.role,
        },
      },
      update: {
        status: data.status,
        progress: data.progress,
        currentTask: data.currentTask,
        updatedAt: new Date(),
      },
      create: {
        sessionId,
        role: data.role,
        name: data.name,
        status: data.status || 'idle',
        progress: data.progress || 0,
        currentTask: data.currentTask,
      },
    });
  }

  async getBySession(sessionId: string) {
    return prisma.agentState.findMany({
      where: { sessionId },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// QUALITY REPORT SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class QualityReportService {
  async create(projectId: string, data: {
    overallScore: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gates: any;
    summary: string;
    recommendations: string[];
  }) {
    return prisma.qualityReport.create({
      data: {
        projectId,
        overallScore: data.overallScore,
        gates: data.gates,
        summary: data.summary,
        recommendations: data.recommendations,
      },
    });
  }

  async getLatest(projectId: string) {
    return prisma.qualityReport.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const services = {
  project: new ProjectService(),
  session: new SessionService(),
  task: new TaskService(),
  file: new FileService(),
  deployment: new DeploymentService(),
  agentState: new AgentStateService(),
  quality: new QualityReportService(),
};
