// UAFSAIDA — Core Type Definitions
// Single source of truth for all system types

// ═══════════════════════════════════════════════════════════════
// PROJECT TYPES
// ═══════════════════════════════════════════════════════════════

export type ProjectStatus =
  | 'draft'
  | 'analyzing'
  | 'planning'
  | 'generating'
  | 'building'
  | 'testing'
  | 'debugging'
  | 'deploying'
  | 'completed'
  | 'failed'
  | 'paused';

export type ProjectComplexity = 'simple' | 'moderate' | 'complex' | 'enterprise';

export type ProjectType =
  | 'website'
  | 'webapp'
  | 'pwa'
  | 'mobile'
  | 'desktop'
  | 'saas'
  | 'api'
  | 'ecommerce'
  | 'crm'
  | 'erp'
  | 'lms'
  | 'dashboard'
  | 'blog'
  | 'marketplace'
  | 'social'
  | 'automation'
  | 'custom';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  complexity: ProjectComplexity;
  type: ProjectType;
  userId: string;
  prompt: string;
  requirements: ProjectRequirement | null;
  architecture: ArchitectureDecision | null;
  techStack: TechStack | null;
  memory: ProjectMemory;
  repoUrl: string | null;
  deployUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectRequirement {
  title: string;
  summary: string;
  targetUsers: string[];
  features: Feature[];
  userStories: UserStory[];
  acceptanceCriteria: AcceptanceCriteria[];
  nonFunctionalRequirements: string[];
  securityRequirements: string[];
  integrationRequirements: string[];
  assumptions: string[];
  constraints: string[];
  outOfScope: string[];
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  complexity: ProjectComplexity;
  category: string;
  dependencies: string[];
}

export interface UserStory {
  id: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface AcceptanceCriteria {
  id: string;
  featureId: string;
  given: string;
  when: string;
  then: string;
}

// ═══════════════════════════════════════════════════════════════
// ARCHITECTURE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ArchitectureDecision {
  id: string;
  projectId: string;
  pattern: ArchitecturePattern;
  frontend: FrontendArch;
  backend: BackendArch;
  database: DatabaseArch;
  infrastructure: InfrastructureArch;
  communicationPattern: CommunicationPattern;
  diagrams: ArchitectureDiagram[];
  rationale: string[];
  tradeoffs: Tradeoff[];
  createdAt: Date;
}

export type ArchitecturePattern =
  | 'monolith'
  | 'modular-monolith'
  | 'microservices'
  | 'serverless'
  | 'jamstack'
  | 'spa'
  | 'mpa'
  | 'event-driven'
  | 'layered';

export type CommunicationPattern =
  | 'rest'
  | 'graphql'
  | 'grpc'
  | 'websocket'
  | 'sse'
  | 'event-bus';

export interface FrontendArch {
  framework: string;
  stateManagement: string;
  styling: string;
  componentLibrary: string;
  routing: string;
  bundler: string;
  testing: string[];
}

export interface BackendArch {
  runtime: string;
  framework: string;
  apiStyle: string;
  authentication: string;
  authorization: string;
  caching: string;
  queue: string;
  testing: string[];
}

export interface DatabaseArch {
  primary: string;
  orm: string;
  caching: string;
  migrations: string;
  backupStrategy: string;
}

export interface InfrastructureArch {
  hosting: string;
  containerization: string;
  ciCd: string;
  monitoring: string;
  logging: string;
  cdn: string;
}

export interface ArchitectureDiagram {
  id: string;
  type: 'component' | 'sequence' | 'deployment' | 'erd' | 'flow';
  title: string;
  content: string; // Mermaid syntax
}

export interface Tradeoff {
  decision: string;
  pros: string[];
  cons: string[];
  chosen: boolean;
  reason: string;
}

// ═══════════════════════════════════════════════════════════════
// TECH STACK TYPES
// ═══════════════════════════════════════════════════════════════

export interface TechStack {
  frontend: FrontendStack;
  backend: BackendStack;
  database: DatabaseStack;
  tools: ToolStack;
  deployment: DeploymentStack;
}

export interface FrontendStack {
  framework: string;
  language: string;
  styling: string;
  stateManagement: string;
  uiLibrary: string;
  formLibrary: string;
  testing: string[];
  icons: string;
  animation: string;
}

export interface BackendStack {
  runtime: string;
  framework: string;
  language: string;
  orm: string;
  auth: string;
  testing: string[];
  validation: string;
  caching: string;
}

export interface DatabaseStack {
  primary: string;
  orm: string;
  caching: string;
  migrations: string;
}

export interface ToolStack {
  versionControl: string;
  packageManager: string;
  codeQuality: string[];
  cicd: string;
  monitoring: string;
}

export interface DeploymentStack {
  platform: string;
  containerization: string;
  cdn: string;
  ssl: string;
  dns: string;
}

// ═══════════════════════════════════════════════════════════════
// AGENT TYPES
// ═══════════════════════════════════════════════════════════════

export type AgentRole =
  | 'orchestrator'
  | 'product-intelligence'
  | 'business-analyst'
  | 'solution-architect'
  | 'frontend-developer'
  | 'backend-developer'
  | 'database-engineer'
  | 'ai-integration'
  | 'mobile-developer'
  | 'desktop-developer'
  | 'devops'
  | 'security'
  | 'qa'
  | 'debugger'
  | 'performance'
  | 'documentation';

export type AgentStatus = 'idle' | 'working' | 'waiting' | 'completed' | 'failed' | 'blocked';

export interface Agent {
  id: string;
  role: AgentRole;
  name: string;
  description: string;
  status: AgentStatus;
  capabilities: string[];
  inputContract: string;
  outputContract: string;
  currentTask: AgentTask | null;
  progress: number;
}

export interface AgentTask {
  id: string;
  agentRole: AgentRole;
  projectId: string;
  sessionId: string;
  title: string;
  description: string;
  status: AgentTaskStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[];
  artifacts: Artifact[];
  startedAt: Date | null;
  completedAt: Date | null;
  estimatedDuration: number; // minutes
  actualDuration: number | null;
}

export type AgentTaskStatus =
  | 'pending'
  | 'in-progress'
  | 'waiting-review'
  | 'completed'
  | 'failed'
  | 'blocked';

export interface Artifact {
  id: string;
  taskId: string;
  type: ArtifactType;
  name: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type ArtifactType =
  | 'prd'
  | 'architecture-doc'
  | 'tech-stack'
  | 'task-list'
  | 'component'
  | 'api-route'
  | 'database-schema'
  | 'test'
  | 'security-report'
  | 'performance-report'
  | 'documentation'
  | 'config'
  | 'fix'
  | 'deployment-config';

// ═══════════════════════════════════════════════════════════════
// CODE GENERATION TYPES
// ═══════════════════════════════════════════════════════════════

export interface CodeGenerationRequest {
  projectId: string;
  agentRole: AgentRole;
  taskDescription: string;
  context: CodeContext;
  outputFormat: 'files' | 'diff' | 'patch';
}

export interface CodeContext {
  existingFiles: ProjectFile[];
  architecture: ArchitectureDecision | null;
  techStack: TechStack | null;
  databaseSchema: string | null;
  relatedArtifacts: Artifact[];
  requirements: ProjectRequirement | null;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  size: number;
  isGenerated: boolean;
  isModified: boolean;
  generatedBy: AgentRole | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedCode {
  files: GeneratedFile[];
  tests: GeneratedFile[];
  documentation: string;
  buildInstructions: string[];
  dependencies: Dependency[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  description: string;
  isTest: boolean;
  isConfig: boolean;
}

export interface Dependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  reason: string;
}

// ═══════════════════════════════════════════════════════════════
// DEBUGGING TYPES
// ═══════════════════════════════════════════════════════════════

export interface DebugSession {
  id: string;
  projectId: string;
  sessionId: string;
  status: DebugStatus;
  errors: DebugError[];
  fixes: DebugFix[];
  startTime: Date;
  endTime: Date | null;
}

export type DebugStatus = 'detecting' | 'analyzing' | 'fixing' | 'validating' | 'resolved' | 'escalated';

export interface DebugError {
  id: string;
  type: 'build' | 'runtime' | 'test' | 'type' | 'lint' | 'security' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  file: string | null;
  line: number | null;
  column: number | null;
  stackTrace: string | null;
  suggestedFix: string | null;
  resolved: boolean;
  resolvedAt: Date | null;
}

export interface DebugFix {
  id: string;
  errorId: string;
  description: string;
  filesChanged: string[];
  diff: string;
  applied: boolean;
  validated: boolean;
  appliedAt: Date | null;
}

// ═══════════════════════════════════════════════════════════════
// SESSION & CHAT TYPES
// ═══════════════════════════════════════════════════════════════

export interface Session {
  id: string;
  projectId: string;
  userId: string;
  messages: ChatMessage[];
  agents: Agent[];
  tasks: AgentTask[];
  status: SessionStatus;
  currentPhase: DevelopmentPhase;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionStatus = 'active' | 'paused' | 'completed' | 'failed';

export type DevelopmentPhase =
  | 'requirement-analysis'
  | 'clarification'
  | 'planning'
  | 'architecture-design'
  | 'tech-selection'
  | 'task-decomposition'
  | 'code-generation'
  | 'code-review'
  | 'testing'
  | 'debugging'
  | 'security-review'
  | 'performance-optimization'
  | 'documentation'
  | 'deployment'
  | 'completed';

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  agentRole: AgentRole | null;
  content: string;
  metadata: MessageMetadata;
  timestamp: Date;
}

export interface MessageMetadata {
  artifacts: Artifact[];
  tasks: string[];
  files: string[];
  tokenCount: number;
  processingTime: number;
}

// ═══════════════════════════════════════════════════════════════
// PROJECT MEMORY TYPES
// ═══════════════════════════════════════════════════════════════

export interface ProjectMemory {
  requirements: MemoryEntry[];
  architecture: MemoryEntry[];
  code: MemoryEntry[];
  bugs: MemoryEntry[];
  user: MemoryEntry[];
  decisions: DecisionRecord[];
  lessonsLearned: string[];
}

export interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  relatedEntries: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type MemoryCategory =
  | 'requirement'
  | 'architecture'
  | 'code-pattern'
  | 'bug-fix'
  | 'user-preference'
  | 'decision'
  | 'lesson';

export interface DecisionRecord {
  id: string;
  decision: string;
  rationale: string;
  alternatives: string[];
  impact: string;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// DEPLOYMENT TYPES
// ═══════════════════════════════════════════════════════════════

export type DeploymentTarget =
  | 'local'
  | 'docker'
  | 'vercel'
  | 'netlify'
  | 'aws'
  | 'gcp'
  | 'azure'
  | 'railway'
  | 'render'
  | 'self-hosted';

export interface DeploymentConfig {
  id: string;
  projectId: string;
  target: DeploymentTarget;
  environment: 'development' | 'staging' | 'production';
  domain: string | null;
  envVars: Record<string, string>;
  buildCommand: string;
  outputDir: string;
  status: DeploymentStatus;
  url: string | null;
  deployedAt: Date | null;
}

export type DeploymentStatus =
  | 'pending'
  | 'building'
  | 'deploying'
  | 'live'
  | 'failed'
  | 'rolled-back';

// ═══════════════════════════════════════════════════════════════
// QUALITY GATE TYPES
// ═══════════════════════════════════════════════════════════════

export interface QualityReport {
  projectId: string;
  timestamp: Date;
  overallScore: number;
  gates: QualityGateResult[];
  summary: string;
  recommendations: string[];
}

export interface QualityGateResult {
  gate: QualityGate;
  status: 'passed' | 'failed' | 'warning' | 'skipped';
  score: number;
  details: string;
  issues: QualityIssue[];
}

export type QualityGate =
  | 'build'
  | 'type-safety'
  | 'testing'
  | 'security'
  | 'performance'
  | 'documentation'
  | 'accessibility'
  | 'code-quality';

export interface QualityIssue {
  gate: QualityGate;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  file: string | null;
  line: number | null;
  suggestion: string;
}
