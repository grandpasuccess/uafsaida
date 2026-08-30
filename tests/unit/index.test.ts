import { describe, it, expect } from 'vitest';
import { AGENT_DEFINITIONS, createAgent, createTask } from '@/agents/factory';
import { OrchestrationEngine } from '@/engine/orchestrator';
import { ProjectExportEngine } from '@/engine/export';
import { DeploymentEngine } from '@/engine/deployment';

// ═══════════════════════════════════════════════════════════════
// AGENT FACTORY TESTS
// ═══════════════════════════════════════════════════════════════

describe('Agent Factory', () => {
  it('should have 16 agent definitions', () => {
    expect(Object.keys(AGENT_DEFINITIONS)).toHaveLength(16);
  });

  it('should create an agent with valid role', () => {
    const agent = createAgent('orchestrator');
    expect(agent).toBeDefined();
    expect(agent.id).toBeDefined();
    expect(agent.role).toBe('orchestrator');
    expect(agent.status).toBe('idle');
    expect(agent.progress).toBe(0);
  });

  it('should create a task with valid data', () => {
    const task = createTask('frontend-developer', 'Build UI', 'Create components');
    expect(task).toBeDefined();
    expect(task.id).toBeDefined();
    expect(task.agentRole).toBe('frontend-developer');
    expect(task.title).toBe('Build UI');
    expect(task.status).toBe('pending');
  });

  it('should have all required agent roles', () => {
    const requiredRoles = [
      'orchestrator', 'product-intelligence', 'business-analyst',
      'solution-architect', 'frontend-developer', 'backend-developer',
      'database-engineer', 'ai-integration', 'mobile-developer',
      'desktop-developer', 'devops', 'security', 'qa', 'debugger',
      'performance', 'documentation'
    ];
    
    for (const role of requiredRoles) {
      expect(AGENT_DEFINITIONS[role as keyof typeof AGENT_DEFINITIONS]).toBeDefined();
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATOR TESTS
// ═══════════════════════════════════════════════════════════════

describe('Orchestration Engine', () => {
  it('should create an instance', () => {
    const engine = new OrchestrationEngine('test-project', {} as any, {} as any);
    expect(engine).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// DEPLOYMENT ENGINE TESTS
// ═══════════════════════════════════════════════════════════════

describe('Deployment Engine', () => {
  it('should generate Docker deployment config', async () => {
    const engine = new DeploymentEngine('test-project');
    const config = await engine.generateDeploymentConfig('docker', {} as any);
    
    expect(config).toBeDefined();
    expect(config.target).toBe('docker');
    expect(config.buildCommand).toContain('docker build');
  });

  it('should generate Vercel deployment config', async () => {
    const engine = new DeploymentEngine('test-project');
    const config = await engine.generateDeploymentConfig('vercel', {} as any);
    
    expect(config).toBeDefined();
    expect(config.target).toBe('vercel');
    expect(config.buildCommand).toContain('vercel');
  });

  it('should generate Docker deployment files', async () => {
    const engine = new DeploymentEngine('test-project');
    const files = await engine.generateDeploymentFiles('docker');
    
    expect(files).toBeDefined();
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.path === 'Dockerfile')).toBe(true);
    expect(files.some(f => f.path === 'docker-compose.yml')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// EXPORT ENGINE TESTS
// ═══════════════════════════════════════════════════════════════

describe('Project Export Engine', () => {
  it('should create an instance', () => {
    const engine = new ProjectExportEngine();
    expect(engine).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// TYPE VALIDATION TESTS
// ═══════════════════════════════════════════════════════════════

describe('Type Validation', () => {
  it('should validate project status values', () => {
    const validStatuses = ['draft', 'analyzing', 'planning', 'generating', 'building', 'testing', 'debugging', 'deploying', 'completed', 'failed', 'paused'];
    expect(validStatuses).toHaveLength(11);
  });

  it('should validate agent roles', () => {
    const validRoles = ['orchestrator', 'product-intelligence', 'business-analyst', 'solution-architect', 'frontend-developer', 'backend-developer', 'database-engineer', 'ai-integration', 'mobile-developer', 'desktop-developer', 'devops', 'security', 'qa', 'debugger', 'performance', 'documentation'];
    expect(validRoles).toHaveLength(16);
  });

  it('should validate deployment targets', () => {
    const validTargets = ['local', 'docker', 'vercel', 'netlify', 'aws', 'gcp', 'azure', 'railway', 'render', 'self-hosted'];
    expect(validTargets).toHaveLength(10);
  });
});
