// UAFSAIDA — Projects API Route
// CRUD operations for projects

import { NextRequest, NextResponse } from 'next/server';
import { Project, ProjectStatus } from '@/types';

// In-memory store (replace with database in production)
const projects: Map<string, Project> = new Map();

// ═══════════════════════════════════════════════════════════════
// GET /api/projects — List all projects
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const userProjects = Array.from(projects.values());
  return NextResponse.json({
    projects: userProjects,
    total: userProjects.length,
  });
}

// ═══════════════════════════════════════════════════════════════
// POST /api/projects — Create a new project
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, prompt, type, complexity } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required', code: 'INVALID_INPUT', status: 422 },
        { status: 422 }
      );
    }

    const project: Project = {
      id: crypto.randomUUID(),
      name,
      description: description || '',
      status: 'draft',
      complexity: complexity || 'moderate',
      type: type || 'custom',
      userId: 'system', // Would come from auth
      prompt: prompt || '',
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

    projects.set(project.id, project);

    return NextResponse.json({
      success: true,
      project,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project', code: 'INTERNAL_ERROR', status: 500 },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// PATCH /api/projects/:id — Update a project
// ═══════════════════════════════════════════════════════════════

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const project = projects.get(params.id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found', code: 'NOT_FOUND', status: 404 },
        { status: 404 }
      );
    }

    const updatedProject = {
      ...project,
      ...body,
      id: project.id,
      updatedAt: new Date(),
    };

    projects.set(params.id, updatedProject);

    return NextResponse.json({
      success: true,
      project: updatedProject,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update project', code: 'INTERNAL_ERROR', status: 500 },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// DELETE /api/projects/:id — Delete a project
// ═══════════════════════════════════════════════════════════════

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const project = projects.get(params.id);

  if (!project) {
    return NextResponse.json(
      { error: 'Project not found', code: 'NOT_FOUND', status: 404 },
      { status: 404 }
    );
  }

  projects.delete(params.id);

  return NextResponse.json({
    success: true,
    message: 'Project deleted',
  });
}
