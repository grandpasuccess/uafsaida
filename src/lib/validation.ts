// UAFSAIDA — Zod Validation Schemas
import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// PROJECT SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  prompt: z.string().min(10, 'Please describe what you want to build').max(5000),
  type: z.enum(['website', 'webapp', 'pwa', 'mobile', 'desktop', 'saas', 'api', 'ecommerce', 'crm', 'erp', 'lms', 'dashboard', 'blog', 'marketplace', 'social', 'automation', 'custom']).default('custom'),
  complexity: z.enum(['simple', 'moderate', 'complex', 'enterprise']).default('moderate'),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['draft', 'analyzing', 'planning', 'generating', 'building', 'testing', 'debugging', 'deploying', 'completed', 'failed', 'paused']).optional(),
  type: z.enum(['website', 'webapp', 'pwa', 'mobile', 'desktop', 'saas', 'api', 'ecommerce', 'crm', 'erp', 'lms', 'dashboard', 'blog', 'marketplace', 'social', 'automation', 'custom']).optional(),
  complexity: z.enum(['simple', 'moderate', 'complex', 'enterprise']).optional(),
  prompt: z.string().min(10).max(5000).optional(),
  repoUrl: z.string().url().optional(),
  deployUrl: z.string().url().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

// ═══════════════════════════════════════════════════════════════
// CHAT SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(10000),
  projectId: z.string().cuid().optional(),
  sessionId: z.string().cuid().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system', 'agent']),
    content: z.string(),
  })).max(50).optional(),
});

export const ChatStreamSchema = z.object({
  message: z.string().min(1).max(10000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(50).optional(),
});

// ═══════════════════════════════════════════════════════════════
// AGENT SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const CreateTaskSchema = z.object({
  agentRole: z.enum(['product-intelligence', 'business-analyst', 'solution-architect', 'frontend-developer', 'backend-developer', 'database-engineer', 'ai-integration', 'mobile-developer', 'desktop-developer', 'devops', 'security', 'qa', 'debugger', 'performance', 'documentation']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  dependencies: z.array(z.string()).default([]),
  estimatedDuration: z.number().int().positive().default(30),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  status: z.enum(['pending', 'in-progress', 'waiting-review', 'completed', 'failed', 'blocked']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  actualDuration: z.number().int().positive().optional(),
});

// ═══════════════════════════════════════════════════════════════
// DEPLOYMENT SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const CreateDeploymentSchema = z.object({
  target: z.enum(['local', 'docker', 'vercel', 'netlify', 'aws', 'gcp', 'azure', 'railway', 'render', 'self-hosted']),
  environment: z.enum(['development', 'staging', 'production']).default('production'),
  domain: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/).optional(),
  envVars: z.record(z.string()).default({}),
  buildCommand: z.string().max(200).optional(),
  outputDir: z.string().max(100).optional(),
});

// ═══════════════════════════════════════════════════════════════
// FILE SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const CreateFileSchema = z.object({
  path: z.string().min(1).max(500),
  content: z.string().max(100000), // 100KB max
  language: z.string().max(50).default('typescript'),
  isGenerated: z.boolean().default(true),
  generatedBy: z.string().max(50).optional(),
});

export const UpdateFileSchema = z.object({
  content: z.string().max(100000).optional(),
  isModified: z.boolean().optional(),
});

// ═══════════════════════════════════════════════════════════════
// EXPORT SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const ExportProjectSchema = z.object({
  outputPath: z.string().max(500).optional(),
  includeDocumentation: z.boolean().default(true),
  includeSetupScript: z.boolean().default(true),
  includeEnvTemplate: z.boolean().default(true),
});

// ═══════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
export type ChatStreamInput = z.infer<typeof ChatStreamSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type CreateDeploymentInput = z.infer<typeof CreateDeploymentSchema>;
export type CreateFileInput = z.infer<typeof CreateFileSchema>;
export type UpdateFileInput = z.infer<typeof UpdateFileSchema>;
export type ExportProjectInput = z.infer<typeof ExportProjectSchema>;
