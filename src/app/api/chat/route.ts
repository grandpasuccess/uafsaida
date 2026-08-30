// UAFSAIDA — Chat API Route
// Handles chat messages and triggers the AI orchestration engine

import { NextRequest, NextResponse } from 'next/server';
import { OrchestrationEngine } from '@/engine/orchestrator';
import {
  Project,
  Session,
  ProjectMemory,
  ChatMessage,
  ProjectStatus,
} from '@/types';

// ═══════════════════════════════════════════════════════════════
// POST /api/chat — Process user message
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, projectId, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required', code: 'INVALID_INPUT', status: 422 },
        { status: 422 }
      );
    }

    // Create or load project
    let project: Project;
    if (projectId) {
      project = await loadProject(projectId);
    } else {
      project = await createProject(message);
    }

    // Create or load session
    let session: Session;
    if (sessionId) {
      session = await loadSession(sessionId);
    } else {
      session = await createSession(project.id);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      role: 'user',
      agentRole: null,
      content: message,
      metadata: { artifacts: [], tasks: [], files: [], tokenCount: 0, processingTime: 0 },
      timestamp: new Date(),
    };
    session.messages.push(userMessage);

    // Load project memory
    const memory = await loadMemory(project.id);

    // Initialize orchestration engine
    const orchestrator = new OrchestrationEngine(project.id, session, memory);

    // Process prompt
    const result = await orchestrator.processPrompt(message);

    // Create assistant response
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      role: 'assistant',
      agentRole: 'orchestrator',
      content: result.message,
      metadata: {
        artifacts: [],
        tasks: [],
        files: result.artifacts?.code?.files?.map(f => f.path) || [],
        tokenCount: 0,
        processingTime: result.duration,
      },
      timestamp: new Date(),
    };

    // Save updated state
    await saveSession(session);
    await saveProject(project);
    await saveMemory(project.id, memory);

    return NextResponse.json({
      success: result.success,
      project,
      session,
      messages: [userMessage, assistantMessage],
      artifacts: result.artifacts,
      duration: result.duration,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        status: 500,
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function createProject(prompt: string): Promise<Project> {
  return {
    id: crypto.randomUUID(),
    name: extractTitle(prompt),
    description: prompt,
    status: 'draft',
    complexity: 'moderate',
    type: 'custom',
    userId: 'system', // Would come from auth
    prompt,
    requirements: null,
    architecture: null,
    techStack: null,
    memory: { requirements: [], architecture: [], code: [], bugs: [], user: [], decisions: [], lessonsLearned: [] },
    repoUrl: null,
    deployUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function loadProject(id: string): Promise<Project> {
  // In production, load from database
  return createProject('Loaded project');
}

async function createSession(projectId: string): Promise<Session> {
  return {
    id: crypto.randomUUID(),
    projectId,
    userId: 'system',
    messages: [],
    agents: [],
    tasks: [],
    status: 'active',
    currentPhase: 'requirement-analysis',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function loadSession(id: string): Promise<Session> {
  // In production, load from database
  return createSession('');
}

async function loadMemory(projectId: string): Promise<ProjectMemory> {
  // In production, load from database
  return {
    requirements: [],
    architecture: [],
    code: [],
    bugs: [],
    user: [],
    decisions: [],
    lessonsLearned: [],
  };
}

async function saveSession(session: Session): Promise<void> {
  // In production, save to database
}

async function saveProject(project: Project): Promise<void> {
  // In production, save to database
}

async function saveMemory(projectId: string, memory: ProjectMemory): Promise<void> {
  // In production, save to database
}

function extractTitle(prompt: string): string {
  // Extract a short title from the prompt
  const words = prompt.split(' ').slice(0, 6).join(' ');
  return words.length > 40 ? words.substring(0, 40) + '...' : words;
}
