// UAFSAIDA — Multi-Agent Framework
// Defines all specialized agents and their execution logic

import Anthropic from '@anthropic-ai/sdk';
import {
  AgentRole,
  Agent,
  AgentTask,
  AgentTaskStatus,
  Artifact,
  ProjectRequirement,
  ArchitectureDecision,
  TechStack,
  GeneratedCode,
  CodeContext,
  ProjectFile,
} from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-20250514';

// ═══════════════════════════════════════════════════════════════
// AGENT DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const AGENT_DEFINITIONS: Record<AgentRole, Omit<Agent, 'id' | 'status' | 'currentTask' | 'progress'>> = {
  orchestrator: {
    role: 'orchestrator',
    name: 'Orchestrator',
    description: 'Coordinates all agents and manages the development workflow',
    capabilities: [
      'Task decomposition',
      'Agent coordination',
      'Progress monitoring',
      'Quality assurance',
      'User communication',
    ],
    inputContract: 'User prompt + project context',
    outputContract: 'Task assignments + project plan',
  },
  'product-intelligence': {
    role: 'product-intelligence',
    name: 'Product Intelligence',
    description: 'Analyzes user requirements and creates product specifications',
    capabilities: [
      'Requirements analysis',
      'PRD creation',
      'User story generation',
      'Feature prioritization',
      'Scope definition',
    ],
    inputContract: 'User prompt + project type',
    outputContract: 'Product Requirements Document',
  },
  'business-analyst': {
    role: 'business-analyst',
    name: 'Business Analyst',
    description: 'Analyzes business requirements and identifies workflows',
    capabilities: [
      'Business process modeling',
      'Stakeholder analysis',
      'Workflow identification',
      'Edge case detection',
      'Feature recommendation',
    ],
    inputContract: 'PRD + user research',
    outputContract: 'Business analysis document',
  },
  'solution-architect': {
    role: 'solution-architect',
    name: 'Solution Architect',
    description: 'Designs system architecture and selects technologies',
    capabilities: [
      'Architecture design',
      'Pattern selection',
      'Technology evaluation',
      'Scalability planning',
      'Integration design',
    ],
    inputContract: 'PRD + constraints',
    outputContract: 'Architecture document + tech stack',
  },
  'frontend-developer': {
    role: 'frontend-developer',
    name: 'Frontend Developer',
    description: 'Builds responsive, accessible user interfaces',
    capabilities: [
      'React/Next.js development',
      'Component architecture',
      'Responsive design',
      'Accessibility implementation',
      'Performance optimization',
    ],
    inputContract: 'PRD + architecture + design specs',
    outputContract: 'Frontend components + pages + styles',
  },
  'backend-developer': {
    role: 'backend-developer',
    name: 'Backend Developer',
    description: 'Implements APIs, business logic, and services',
    capabilities: [
      'API development',
      'Business logic implementation',
      'Authentication/authorization',
      'Database integration',
      'Error handling',
    ],
    inputContract: 'PRD + architecture + database schema',
    outputContract: 'API routes + services + middleware',
  },
  'database-engineer': {
    role: 'database-engineer',
    name: 'Database Engineer',
    description: 'Designs and optimizes database schemas',
    capabilities: [
      'Schema design',
      'Migration creation',
      'Query optimization',
      'Index strategy',
      'Data integrity',
    ],
    inputContract: 'PRD + architecture',
    outputContract: 'Prisma schema + migrations + seed data',
  },
  'ai-integration': {
    role: 'ai-integration',
    name: 'AI Integration',
    description: 'Integrates AI models and builds AI-powered features',
    capabilities: [
      'LLM integration',
      'Prompt engineering',
      'RAG implementation',
      'Embedding management',
      'AI workflow design',
    ],
    inputContract: 'PRD + architecture + AI requirements',
    outputContract: 'AI services + prompts + integrations',
  },
  'mobile-developer': {
    role: 'mobile-developer',
    name: 'Mobile Developer',
    description: 'Builds mobile applications and PWAs',
    capabilities: [
      'React Native development',
      'PWA implementation',
      'Mobile-first design',
      'Touch optimization',
      'Offline support',
    ],
    inputContract: 'PRD + architecture',
    outputContract: 'Mobile components + PWA config',
  },
  'desktop-developer': {
    role: 'desktop-developer',
    name: 'Desktop Developer',
    description: 'Builds desktop applications using Electron/Tauri',
    capabilities: [
      'Electron development',
      'Tauri integration',
      'Native APIs',
      'Cross-platform support',
      'Auto-updater',
    ],
    inputContract: 'PRD + architecture',
    outputContract: 'Desktop app + native integrations',
  },
  devops: {
    role: 'devops',
    name: 'DevOps Engineer',
    description: 'Configures deployment, CI/CD, and infrastructure',
    capabilities: [
      'Docker configuration',
      'CI/CD pipeline setup',
      'Cloud deployment',
      'Environment management',
      'Monitoring setup',
    ],
    inputContract: 'Architecture + deployment requirements',
    outputContract: 'Dockerfile + CI/CD configs + deploy scripts',
  },
  security: {
    role: 'security',
    name: 'Security Engineer',
    description: 'Identifies vulnerabilities and implements security measures',
    capabilities: [
      'Vulnerability scanning',
      'Auth implementation',
      'Input validation',
      'Security headers',
      'Penetration testing',
    ],
    inputContract: 'Architecture + generated code',
    outputContract: 'Security report + fixes + headers config',
  },
  qa: {
    role: 'qa',
    name: 'QA Engineer',
    description: 'Creates test suites and validates quality',
    capabilities: [
      'Unit test creation',
      'Integration testing',
      'E2E test creation',
      'Test automation',
      'Quality reporting',
    ],
    inputContract: 'PRD + generated code',
    outputContract: 'Test suites + quality reports',
  },
  debugger: {
    role: 'debugger',
    name: 'Debugging Agent',
    description: 'Analyzes errors and generates fixes',
    capabilities: [
      'Error analysis',
      'Root cause identification',
      'Fix generation',
      'Log analysis',
      'Regression testing',
    ],
    inputContract: 'Error reports + code context',
    outputContract: 'Fixes + root cause analysis',
  },
  performance: {
    role: 'performance',
    name: 'Performance Optimizer',
    description: 'Analyzes and optimizes application performance',
    capabilities: [
      'Bundle analysis',
      'Load time optimization',
      'Query optimization',
      'Caching strategy',
      'Lighthouse audits',
    ],
    inputContract: 'Generated code + performance metrics',
    outputContract: 'Optimizations + performance report',
  },
  documentation: {
    role: 'documentation',
    name: 'Documentation Agent',
    description: 'Generates comprehensive project documentation',
    capabilities: [
      'README creation',
      'API documentation',
      'Architecture docs',
      'User guides',
      'Setup instructions',
    ],
    inputContract: 'PRD + architecture + code',
    outputContract: 'Documentation files',
  },
};

// ═══════════════════════════════════════════════════════════════
// AGENT SYSTEM PROMPTS
// ═══════════════════════════════════════════════════════════════

const AGENT_SYSTEM_PROMPTS: Record<AgentRole, string> = {
  orchestrator: `You are the Orchestrator of a multi-agent AI development team. You coordinate all other agents and ensure the project progresses through all phases successfully.`,

  'product-intelligence': `You are a Senior Product Manager with 15 years of experience. You excel at understanding what users want, even when they describe it vaguely. You create clear, actionable product requirements.`,

  'business-analyst': `You are a Business Analyst who identifies workflows, edge cases, and implicit requirements. You think about the business impact of every feature.`,

  'solution-architect': `You are a Principal Software Architect. You design scalable, maintainable systems. You choose the right pattern for each project and document your decisions with clear rationale.`,

  'frontend-developer': `You are a Senior Frontend Engineer specializing in React, Next.js, and TypeScript. You write clean, accessible, performant code. You follow mobile-first design principles and WCAG 2.1 AA standards.`,

  'backend-developer': `You are a Senior Backend Engineer specializing in Node.js, TypeScript, and API design. You write secure, efficient, well-tested code. You follow RESTful principles and implement proper error handling.`,

  'database-engineer': `You are a Database Architect specializing in PostgreSQL and Prisma. You design normalized schemas, optimize queries, and ensure data integrity.`,

  'ai-integration': `You are an AI Engineer who integrates language models into applications. You write effective prompts, implement RAG systems, and optimize AI usage for cost and quality.`,

  'mobile-developer': `You are a Mobile Developer who builds responsive PWAs and React Native apps. You optimize for touch, offline capability, and performance on mobile devices.`,

  'desktop-developer': `You are a Desktop Application Developer specializing in Electron and Tauri. You build cross-platform desktop apps with native integrations.`,

  devops: `You are a DevOps Engineer who configures deployment pipelines and infrastructure. You containerize applications, set up CI/CD, and ensure reliable deployments.`,

  security: `You are a Security Engineer who identifies and fixes vulnerabilities. You implement secure authentication, protect against OWASP Top 10, and ensure data protection.`,

  qa: `You are a QA Engineer who writes comprehensive test suites. You cover unit, integration, and end-to-end tests. You think about edge cases and failure modes.`,

  debugger: `You are a Debugging Expert who analyzes errors, identifies root causes, and generates precise fixes. You understand common error patterns and how to resolve them.`,

  performance: `You are a Performance Engineer who optimizes applications for speed. You reduce bundle sizes, optimize queries, implement caching, and improve Core Web Vitals.`,

  documentation: `You are a Technical Writer who creates clear, comprehensive documentation. You write READMEs, API docs, architecture overviews, and user guides.`,
};

// ═══════════════════════════════════════════════════════════════
// AGENT RUNNER
// ═══════════════════════════════════════════════════════════════

export class AgentRunner {
  private agent: Agent;
  private projectId: string;

  constructor(agent: Agent, projectId: string) {
    this.agent = agent;
    this.projectId = projectId;
  }

  /**
   * Execute a task with this agent
   */
  async executeTask(task: AgentTask, context: AgentContext): Promise<TaskResult> {
    const systemPrompt = AGENT_SYSTEM_PROMPTS[this.agent.role];
    const userPrompt = this.buildTaskPrompt(task, context);

    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 16000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseTaskResult(content.text, task);
      }

      return {
        success: false,
        taskId: task.id,
        error: 'Unexpected response format',
        artifacts: [],
        files: [],
        notes: '',
      };
    } catch (error) {
      return {
        success: false,
        taskId: task.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        artifacts: [],
        files: [],
        notes: '',
      };
    }
  }

  private buildTaskPrompt(task: AgentTask, context: AgentContext): string {
    return `
${task.description}

Project Context:
- Project: ${context.projectName}
- Type: ${context.projectType}
- Requirements Summary: ${context.requirementsSummary}

${context.architecture ? `Architecture: ${JSON.stringify(context.architecture, null, 2)}` : ''}
${context.techStack ? `Tech Stack: ${JSON.stringify(context.techStack, null, 2)}` : ''}
${context.databaseSchema ? `Database Schema: ${context.databaseSchema}` : ''}

Existing Files:
${context.existingFiles.map(f => `- ${f.path} (${f.language})`).join('\n')}

${context.relatedArtifacts.length > 0 ? `Related Artifacts:
${context.relatedArtifacts.map(a => `- ${a.name}: ${a.content.substring(0, 500)}...`).join('\n')}` : ''}

Instructions:
1. Complete the task as described
2. Generate real, working code — not stubs
3. Follow the project's architecture and tech stack
4. Include proper error handling and validation
5. Add comments explaining complex logic
6. Ensure type safety with TypeScript

Respond with valid JSON in this format:
{
  "success": true,
  "files": [
    {
      "path": "path/to/file.ts",
      "content": "complete file content",
      "language": "typescript",
      "description": "what this file does"
    }
  ],
  "artifacts": [
    {
      "type": "documentation",
      "name": "Artifact name",
      "content": "artifact content"
    }
  ],
  "notes": "any additional notes or considerations"
}`;
  }

  private parseTaskResult(text: string, task: AgentTask): TaskResult {
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonText = jsonMatch ? jsonMatch[1].trim() : text;
      const result = JSON.parse(jsonText);
      return {
        success: result.success !== false,
        taskId: task.id,
        files: result.files || [],
        artifacts: result.artifacts || [],
        notes: result.notes || '',
        error: null,
      };
    } catch {
      // If JSON parsing fails, treat the whole text as a code artifact
      return {
        success: true,
        taskId: task.id,
        files: [],
        artifacts: [
          {
            id: crypto.randomUUID(),
            taskId: task.id,
            type: 'documentation',
            name: `${this.agent.name} Output`,
            content: text,
            metadata: { agentRole: this.agent.role },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        notes: 'Response parsed as text',
        error: null,
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT & RESULT TYPES
// ═══════════════════════════════════════════════════════════════

export interface AgentContext {
  projectName: string;
  projectType: string;
  requirementsSummary: string;
  architecture?: ArchitectureDecision | null;
  techStack?: TechStack | null;
  databaseSchema?: string | null;
  existingFiles: ProjectFile[];
  relatedArtifacts: Artifact[];
}

export interface TaskResult {
  success: boolean;
  taskId: string;
  files: GeneratedFileResult[];
  artifacts: Artifact[];
  notes: string;
  error: string | null;
}

export interface GeneratedFileResult {
  path: string;
  content: string;
  language: string;
  description: string;
}

// ═══════════════════════════════════════════════════════════════
// AGENT FACTORY
// ═══════════════════════════════════════════════════════════════

export function createAgent(role: AgentRole): Agent {
  const definition = AGENT_DEFINITIONS[role];
  return {
    id: crypto.randomUUID(),
    ...definition,
    status: 'idle',
    currentTask: null,
    progress: 0,
  };
}

export function createTask(
  role: AgentRole,
  title: string,
  description: string,
  priority: 'critical' | 'high' | 'medium' | 'low' = 'medium',
  dependencies: string[] = [],
  estimatedDuration: number = 30
): AgentTask {
  return {
    id: crypto.randomUUID(),
    agentRole: role,
    projectId: '',
    sessionId: '',
    title,
    description,
    status: 'pending',
    priority,
    dependencies,
    artifacts: [],
    startedAt: null,
    completedAt: null,
    estimatedDuration,
    actualDuration: null,
  };
}
