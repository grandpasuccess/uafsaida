// UAFSAIDA — Production Database Service Layer
// Real database operations using Prisma (replaces in-memory store)

// Dynamic import to handle Prisma client generation
let PrismaClientClass: any;
let prismaClient: any;

function getPrismaClient(): any {
  return prismaClient;
}

function loadPrismaClient(): void {
  if (PrismaClientClass) return;
  
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
}

// Initialize Prisma class
loadPrismaClient();

// Singleton Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// Create client lazily
function createPrismaClient(): any {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClientClass({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return globalForPrisma.prisma;
}

// Export as proxy to handle lazy initialization
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = new Proxy({}, {
  get(_target, prop) {
    const client = createPrismaClient();
    return client[prop];
  }
});

if (process.env.NODE_ENV !== 'production') {
  // Ensure client is created in development
  createPrismaClient();
}

// ═══════════════════════════════════════════════════════════════
// PROJECT SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class ProjectService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getClient(): any {
    return getPrismaClient() || prisma;
  }

  async create(data: {
    name: string;
    description?: string;
    prompt: string;
    type?: string;
    complexity?: string;
    userId: string;
  }) {
    return this.getClient().project.create({
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
    return this.getClient().project.findUnique({
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
    return this.getClient().project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        files: { take: 1 },
        _count: { select: { files: true, sessions: true } },
      },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    return this.getClient().project.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async delete(id: string) {
    return this.getClient().project.delete({ where: { id } });
  }

  async updateStatus(id: string, status: string) {
    return this.getClient().project.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// SESSION SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class SessionService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getClient(): any {
    return getPrismaClient() || prisma;
  }

  async create(projectId: string, userId: string) {
    return this.getClient().agentSession.create({
      data: {
        projectId,
        userId,
        status: 'active',
        currentPhase: 'requirement-analysis',
      },
    });
  }

  async getById(id: string) {
    return this.getClient().agentSession.findUnique({
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
    return this.getClient().chatMessage.create({
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
    return this.getClient().agentSession.update({
      where: { id: sessionId },
      data: { currentPhase: phase, updatedAt: new Date() },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// TASK SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class TaskService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getClient(): any {
    return getPrismaClient() || prisma;
  }

  async create(data: {
    sessionId: string;
    agentRole: string;
    title: string;
    description: string;
    priority?: string;
    dependencies?: string[];
    estimatedDuration?: number;
  }) {
    return this.getClient().agentTask.create({
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
    return this.getClient().agentTask.update({
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
    return this.getClient().artifact.create({
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getClient(): any {
    return getPrismaClient() || prisma;
  }

  async create(projectId: string, data: {
    path: string;
    content: string;
    language?: string;
    isGenerated?: boolean;
    generatedBy?: string;
  }) {
    return this.getClient().projectFile.create({
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
    return this.getClient().projectFile.findMany({
      where: { projectId },
      orderBy: { path: 'asc' },
    });
  }

  async update(id: string, content: string) {
    return this.getClient().projectFile.update({
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
    return this.getClient().projectFile.delete({ where: { id } });
  }
}

// ═══════════════════════════════════════════════════════════════
// DEPLOYMENT SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class DeploymentService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getClient(): any {
    return getPrismaClient() || prisma;
  }

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
    return this.getClient().deployment.create({
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
    return this.getClient().deployment.update({
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
    return this.getClient().deployment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// AGENT STATE SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class AgentStateService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getClient(): any {
    return getPrismaClient() || prisma;
  }

  async upsert(sessionId: string, data: {
    role: string;
    name: string;
    status?: string;
    progress?: number;
    currentTask?: string;
  }) {
    return this.getClient().agentState.upsert({
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
    return this.getClient().agentState.findMany({
      where: { sessionId },
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// QUALITY REPORT SERVICE (Production)
// ═══════════════════════════════════════════════════════════════

export class QualityReportService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getClient(): any {
    return getPrismaClient() || prisma;
  }

  async create(projectId: string, data: {
    overallScore: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gates: any;
    summary: string;
    recommendations: string[];
  }) {
    return this.getClient().qualityReport.create({
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
    return this.getClient().qualityReport.findFirst({
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
