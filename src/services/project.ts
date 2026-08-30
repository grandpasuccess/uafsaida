// UAFSAIDA — Services Layer
// Business logic for project operations

import {
  Project,
  Session,
  ChatMessage,
  ProjectFile,
  AgentTask,
  Artifact,
  Agent,
  ProjectMemory,
  ProjectStatus,
} from '@/types';

// ═══════════════════════════════════════════════════════════════
// PROJECT SERVICE
// ═══════════════════════════════════════════════════════════════

export class ProjectService {
  private projects: Map<string, Project> = new Map();
  private sessions: Map<string, Session> = new Map();
  private files: Map<string, ProjectFile[]> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private tasks: Map<string, AgentTask[]> = new Map();
  private agents: Map<string, Agent[]> = new Map();
  private memories: Map<string, ProjectMemory> = new Map();

  async createProject(data: Partial<Project>): Promise<Project> {
    const project: Project = {
      id: crypto.randomUUID(),
      name: data.name || 'Untitled Project',
      description: data.description || '',
      status: 'draft',
      complexity: data.complexity || 'moderate',
      type: data.type || 'custom',
      userId: data.userId || 'system',
      prompt: data.prompt || '',
      requirements: null,
      architecture: null,
      techStack: null,
      memory: {
        requirements: [],
        architecture: [],
        code: [],
        bugs: [],
        user: [],
        decisions: [],
        lessonsLearned: [],
      },
      repoUrl: null,
      deployUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(project.id, project);
    this.files.set(project.id, []);
    this.messages.set(project.id, []);
    this.tasks.set(project.id, []);
    this.agents.set(project.id, []);
    this.memories.set(project.id, project.memory);
    return project;
  }

  async getProject(id: string): Promise<Project | null> {
    return this.projects.get(id) || null;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
    const project = this.projects.get(id);
    if (!project) return null;
    const updated = { ...project, ...data, id, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    this.projects.delete(id);
    this.files.delete(id);
    this.messages.delete(id);
    this.tasks.delete(id);
    this.agents.delete(id);
    this.memories.delete(id);
    return true;
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      project.status = status;
      project.updatedAt = new Date();
    }
  }

  async addFile(projectId: string, file: ProjectFile): Promise<void> {
    const files = this.files.get(projectId) || [];
    files.push(file);
    this.files.set(projectId, files);
  }

  async getFiles(projectId: string): Promise<ProjectFile[]> {
    return this.files.get(projectId) || [];
  }

  async addMessage(projectId: string, message: ChatMessage): Promise<void> {
    const messages = this.messages.get(projectId) || [];
    messages.push(message);
    this.messages.set(projectId, messages);
  }

  async getMessages(projectId: string): Promise<ChatMessage[]> {
    return this.messages.get(projectId) || [];
  }

  async addTask(projectId: string, task: AgentTask): Promise<void> {
    const tasks = this.tasks.get(projectId) || [];
    tasks.push(task);
    this.tasks.set(projectId, tasks);
  }

  async getTasks(projectId: string): Promise<AgentTask[]> {
    return this.tasks.get(projectId) || [];
  }

  async getAgents(projectId: string): Promise<Agent[]> {
    return this.agents.get(projectId) || [];
  }

  async setAgents(projectId: string, agents: Agent[]): Promise<void> {
    this.agents.set(projectId, agents);
  }

  async getMemory(projectId: string): Promise<ProjectMemory> {
    return this.memories.get(projectId) || {
      requirements: [],
      architecture: [],
      code: [],
      bugs: [],
      user: [],
      decisions: [],
      lessonsLearned: [],
    };
  }

  async addToMemory(
    projectId: string,
    category: keyof ProjectMemory,
    key: string,
    value: string
  ): Promise<void> {
    const memory = await this.getMemory(projectId);
    (memory[category] as any[]).push({
      id: crypto.randomUUID(),
      category,
      key,
      value,
      importance: 'medium',
      relatedEntries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.memories.set(projectId, memory);
  }
}

export const projectService = new ProjectService();
