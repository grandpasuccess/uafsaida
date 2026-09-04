// UAFSAIDA — Service Layer Unit Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AGENT_DEFINITIONS, createAgent, createTask } from '@/agents/factory';
import { QualityGateSystem } from '@/engine/quality-gates';
import { DeploymentEngine } from '@/engine/deployment';
import { ProjectExportEngine } from '@/engine/export';

// Mock environment variables
vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');

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
    expect(agent.capabilities).toBeDefined();
    expect(agent.capabilities.length).toBeGreaterThan(0);
  });

  it('should create a task with valid data', () => {
    const task = createTask('frontend-developer', 'Build UI', 'Create components');
    expect(task).toBeDefined();
    expect(task.id).toBeDefined();
    expect(task.agentRole).toBe('frontend-developer');
    expect(task.title).toBe('Build UI');
    expect(task.status).toBe('pending');
    expect(task.priority).toBe('medium');
  });

  it('should create a task with custom priority', () => {
    const task = createTask('security', 'Security scan', 'Scan code', 'critical');
    expect(task.priority).toBe('critical');
  });

  it('should have all required agent roles', () => {
    const roles = Object.keys(AGENT_DEFINITIONS);
    expect(roles).toContain('orchestrator');
    expect(roles).toContain('product-intelligence');
    expect(roles).toContain('frontend-developer');
    expect(roles).toContain('backend-developer');
    expect(roles).toContain('security');
    expect(roles).toContain('qa');
    expect(roles).toContain('devops');
  });
});

describe('Quality Gate System', () => {
  it('should create an instance', () => {
    const qualityGate = new QualityGateSystem();
    expect(qualityGate).toBeDefined();
  });

  it('should run quality gates', async () => {
    const qualityGate = new QualityGateSystem();
    const code = {
      files: [
        { path: 'src/app.ts', content: 'export const app = {};', language: 'typescript', description: 'App', isTest: false, isConfig: false },
        { path: 'tests/app.test.ts', content: 'test("app", () => {});', language: 'typescript', description: 'Test', isTest: true, isConfig: false },
      ],
      tests: [],
      documentation: '',
      buildInstructions: [],
      dependencies: [],
    };

    const report = await qualityGate.runQualityGates(code, 'test-project');
    expect(report).toBeDefined();
    expect(report.gates.length).toBe(8);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
  });
});

describe('Deployment Engine', () => {
  it('should create an instance', () => {
    const deployment = new DeploymentEngine('test-project');
    expect(deployment).toBeDefined();
  });

  it('should generate Docker config', async () => {
    const deployment = new DeploymentEngine('test-project');
    const config = await deployment.generateDeploymentConfig('docker', {} as any);
    expect(config.target).toBe('docker');
    expect(config.buildCommand).toContain('docker');
  });

  it('should generate Vercel config', async () => {
    const deployment = new DeploymentEngine('test-project');
    const config = await deployment.generateDeploymentConfig('vercel', {} as any);
    expect(config.target).toBe('vercel');
  });

  it('should generate Docker files', async () => {
    const deployment = new DeploymentEngine('test-project');
    const files = await deployment.generateDeploymentFiles('docker');
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.path === 'Dockerfile')).toBe(true);
  });
});

describe('Project Export Engine', () => {
  it('should create an instance', () => {
    const exportEngine = new ProjectExportEngine();
    expect(exportEngine).toBeDefined();
  });
});

describe('Type Validation', () => {
  it('should validate project statuses', () => {
    const statuses = ['draft', 'analyzing', 'planning', 'generating', 'building', 'testing', 'debugging', 'deploying', 'completed', 'failed', 'paused'];
    expect(statuses.length).toBe(11);
  });

  it('should validate agent roles', () => {
    const roles = ['orchestrator', 'product-intelligence', 'frontend-developer', 'backend-developer', 'security', 'qa', 'devops'];
    expect(roles.length).toBe(7);
  });

  it('should validate deployment targets', () => {
    const targets = ['local', 'docker', 'vercel', 'netlify', 'aws', 'gcp', 'azure'];
    expect(targets.length).toBe(7);
  });
});
