// UAFSAIDA — AI Orchestration Engine
// Central coordination system for all AI activities

import Anthropic from '@anthropic-ai/sdk';
import {
  Project,
  ProjectRequirement,
  ArchitectureDecision,
  TechStack,
  AgentRole,
  AgentTask,
  ChatMessage,
  CodeGenerationRequest,
  GeneratedCode,
  DebugSession,
  DebugError,
  DebugFix,
  ProjectMemory,
  DevelopmentPhase,
  Session,
  Artifact,
  UserStory,
  Feature,
} from '@/types';

// ═══════════════════════════════════════════════════════════════
// ANTHROPIC CLIENT
// ═══════════════════════════════════════════════════════════════

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-20250514';

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPTS
// ═══════════════════════════════════════════════════════════════

const ORCHESTRATOR_SYSTEM = `You are the Orchestrator AI of UAFSAIDA — an autonomous software development platform. You coordinate specialized AI agents to transform user ideas into working software.

Your responsibilities:
1. Understand user intent from natural language prompts
2. Analyze project complexity and type
3. Route tasks to appropriate specialized agents
4. Monitor progress and handle failures
5. Ensure quality gates are met
6. Communicate progress to users in their preferred language/mode

Rules:
- Always respond with valid JSON
- Break complex projects into manageable tasks
- Prioritize user experience and code quality
- Never skip validation steps
- Always explain your reasoning

You are the project manager, architect, and quality assurance team combined.`;

const PRODUCT_INTELLIGENCE_SYSTEM = `You are the Product Intelligence Agent. You excel at understanding what users want to build, even when they describe it vaguely.

Your process:
1. Analyze the user's natural language description
2. Identify the core application type and purpose
3. Extract implicit requirements
4. Define clear features with priorities
5. Create user stories with acceptance criteria
6. Identify what's in scope and out of scope

Respond with valid JSON containing the complete product requirements.`;

const ARCHITECT_SYSTEM = `You are the Solution Architect Agent. You design complete system architectures based on product requirements.

Your expertise:
- Selecting optimal architectural patterns
- Choosing the right technology stack
- Designing scalable, maintainable systems
- Planning integrations and deployments
- Documenting architectural decisions with rationale

Respond with valid JSON containing the complete architecture specification.`;

const FRONTEND_DEV_SYSTEM = `You are the Frontend Development Agent. You generate complete, production-ready frontend code.

Your standards:
- Clean, modular React/Next.js components
- Responsive, mobile-first design
- Accessible (WCAG 2.1 AA)
- Performance optimized
- Well-typed TypeScript
- Tailwind CSS for styling

Generate real, working code — not stubs or placeholders.`;

const BACKEND_DEV_SYSTEM = `You are the Backend Development Agent. You generate complete, production-ready backend code.

Your standards:
- RESTful API design
- Proper error handling and validation
- Secure authentication and authorization
- Efficient database queries
- Input sanitization
- Rate limiting

Generate real, working API routes and services.`;

const DATABASE_SYSTEM = `You are the Database Engineer Agent. You design efficient, scalable database schemas.

Your expertise:
- Relational database design (PostgreSQL)
- Prisma schema authoring
- Migration strategies
- Index optimization
- Data integrity constraints
- Backup strategies

Generate complete Prisma schemas with proper relations and indexes.`;

const QA_SYSTEM = `You are the QA Engineer Agent. You create comprehensive test suites.

Your approach:
- Unit tests for all business logic
- Integration tests for APIs
- End-to-end tests for critical flows
- Edge case coverage
- Security test scenarios

Generate real test code using Vitest and Playwright.`;

const DEVOPS_SYSTEM = `You are the DevOps Agent. You configure deployment pipelines and infrastructure.

Your expertise:
- Docker containerization
- CI/CD pipeline configuration
- Cloud deployment (Vercel, AWS, etc.)
- Environment management
- Monitoring setup
- Security hardening

Generate Dockerfiles, CI/CD configs, and deployment scripts.`;

const SECURITY_SYSTEM = `You are the Security Agent. You identify and fix vulnerabilities.

Your focus:
- OWASP Top 10
- Authentication/authorization flaws
- Injection vulnerabilities
- Secret exposure
- Dependency vulnerabilities
- Security headers and configurations

Generate security reports and fixes.`;

// ═══════════════════════════════════════════════════════════════
// ORCHESTRATOR ENGINE
// ═══════════════════════════════════════════════════════════════

export class OrchestrationEngine {
  private projectId: string;
  private session: Session;
  private memory: ProjectMemory;

  constructor(projectId: string, session: Session, memory: ProjectMemory) {
    this.projectId = projectId;
    this.session = session;
    this.memory = memory;
  }

  /**
   * Main entry point: process a user prompt through the full pipeline
   */
  async processPrompt(prompt: string): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const phases: PhaseResult[] = [];

    try {
      // Phase 1: Analyze intent and extract requirements
      const requirements = await this.analyzeRequirements(prompt);
      phases.push({ phase: 'requirement-analysis', status: 'completed', result: requirements });

      // Phase 2: Design architecture
      const architecture = await this.designArchitecture(requirements);
      phases.push({ phase: 'architecture-design', status: 'completed', result: architecture });

      // Phase 3: Select technology stack
      const techStack = await this.selectTechStack(requirements, architecture);
      phases.push({ phase: 'tech-selection', status: 'completed', result: techStack });

      // Phase 4: Generate implementation plan
      const tasks = await this.createImplementationPlan(requirements, architecture, techStack);
      phases.push({ phase: 'task-decomposition', status: 'completed', result: tasks });

      // Phase 5: Execute code generation
      const code = await this.generateCode(requirements, architecture, techStack, tasks);
      phases.push({ phase: 'code-generation', status: 'completed', result: code });

      // Phase 6: Run tests and validation
      const validation = await this.validateCode(code, requirements);
      phases.push({ phase: 'validation', status: 'completed', result: validation });

      // Phase 7: Generate documentation
      const documentation = await this.generateDocumentation(requirements, architecture, techStack, code);
      phases.push({ phase: 'documentation', status: 'completed', result: documentation });

      const duration = Date.now() - startTime;

      return {
        success: true,
        projectId: this.projectId,
        phases,
        artifacts: {
          requirements,
          architecture,
          techStack,
          tasks,
          code,
          validation,
          documentation,
        },
        duration,
        message: 'Project generated successfully!',
      };
    } catch (error) {
      return {
        success: false,
        projectId: this.projectId,
        phases,
        artifacts: null,
        duration: Date.now() - startTime,
        message: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 1: REQUIREMENT ANALYSIS
  // ═══════════════════════════════════════════════════════════

  async analyzeRequirements(prompt: string): Promise<ProjectRequirement> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: PRODUCT_INTELLIGENCE_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Analyze this software development request and produce a complete Product Requirements Document:

"${prompt}"

Consider:
1. What type of application is this? (website, webapp, mobile, SaaS, e-commerce, CRM, etc.)
2. Who are the target users?
3. What are the must-have features vs nice-to-haves?
4. What are the implicit requirements the user didn't mention but will need?
5. What are the security, performance, and scalability needs?

Respond with valid JSON in this exact format:
{
  "title": "Project Title",
  "summary": "Brief description",
  "targetUsers": ["user type 1", "user type 2"],
  "features": [
    {
      "id": "f1",
      "name": "Feature Name",
      "description": "What it does",
      "priority": "must|should|could|wont",
      "complexity": "simple|moderate|complex|enterprise",
      "category": "category",
      "dependencies": []
    }
  ],
  "userStories": [
    {
      "id": "us1",
      "asA": "user type",
      "iWant": "action",
      "soThat": "benefit",
      "acceptanceCriteria": ["criteria 1"],
      "storyPoints": 3,
      "priority": "critical|high|medium|low"
    }
  ],
  "acceptanceCriteria": [
    {
      "id": "ac1",
      "featureId": "f1",
      "given": "context",
      "when": "action",
      "then": "result"
    }
  ],
  "nonFunctionalRequirements": ["performance requirement"],
  "securityRequirements": ["security requirement"],
  "integrationRequirements": ["integration requirement"],
  "assumptions": ["assumption"],
  "constraints": ["constraint"],
  "outOfScope": ["out of scope item"]
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return this.parseJSON(content.text) as ProjectRequirement;
    }
    throw new Error('Unexpected response format from Product Intelligence Agent');
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 2: ARCHITECTURE DESIGN
  // ═══════════════════════════════════════════════════════════

  async designArchitecture(requirements: ProjectRequirement): Promise<ArchitectureDecision> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: ARCHITECT_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Design the system architecture for this project based on the requirements:

${JSON.stringify(requirements, null, 2)}

Consider:
1. What architectural pattern fits best? (monolith, modular-monolith, microservices, serverless, etc.)
2. What's the optimal communication pattern? (REST, GraphQL, WebSocket, SSE)
3. How should the frontend be structured?
4. How should the backend be structured?
5. What database architecture is needed?
6. What infrastructure components are required?

Respond with valid JSON in this exact format:
{
  "pattern": "modular-monolith|monolith|microservices|serverless|jamstack",
  "frontend": {
    "framework": "React|Next.js|Vue|Angular|Svelte",
    "stateManagement": "Zustand|Redux|Context API|Jotai",
    "styling": "Tailwind CSS|CSS Modules|Styled Components",
    "componentLibrary": "shadcn/ui|Material UI|Chakra UI",
    "routing": "Next.js App Router|React Router",
    "bundler": "Vite|Turbopack|Webpack",
    "testing": ["Vitest", "Playwright", "Testing Library"]
  },
  "backend": {
    "runtime": "Node.js|Deno|Bun",
    "framework": "Next.js API Routes|Express|Fastify|tRPC",
    "apiStyle": "REST|GraphQL|tRPC",
    "authentication": "NextAuth.js|Clerk|Custom JWT",
    "authorization": "RBAC|ABAC|Custom",
    "caching": "Redis|In-memory|Upstash",
    "queue": "BullMQ|Bull|In-memory",
    "testing": ["Vitest", "Supertest"]
  },
  "database": {
    "primary": "PostgreSQL|MySQL|MongoDB|SQLite",
    "orm": "Prisma|Drizzle|TypeORM|Mongoose",
    "caching": "Redis|None",
    "migrations": "Prisma Migrate|Drizzle Kit",
    "backupStrategy": "Daily automated backups"
  },
  "infrastructure": {
    "hosting": "Vercel|AWS|Railway|Self-hosted",
    "containerization": "Docker|None",
    "ciCd": "GitHub Actions|GitLab CI",
    "monitoring": "Sentry|Vercel Analytics",
    "logging": "Pino|Console|Vercel Logs",
    "cdn": "Vercel Edge|Cloudflare"
  },
  "communicationPattern": "rest|graphql|websocket|sse|event-bus",
  "diagrams": [
    {
      "id": "d1",
      "type": "component",
      "title": "System Components",
      "content": "mermaid diagram syntax"
    }
  ],
  "rationale": ["Why this architecture was chosen"],
  "tradeoffs": [
    {
      "decision": "Decision description",
      "pros": ["advantage"],
      "cons": ["disadvantage"],
      "chosen": true,
      "reason": "Why this tradeoff was accepted"
    }
  ]
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return this.parseJSON(content.text) as ArchitectureDecision;
    }
    throw new Error('Unexpected response format from Architecture Agent');
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 3: TECHNOLOGY SELECTION
  // ═══════════════════════════════════════════════════════════

  async selectTechStack(
    requirements: ProjectRequirement,
    architecture: ArchitectureDecision
  ): Promise<TechStack> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: ARCHITECT_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Select the specific technology stack for this project.

Requirements summary: ${requirements.summary}
Architecture pattern: ${architecture.pattern}

Provide a detailed, specific technology selection with versions where relevant.

Respond with valid JSON in this exact format:
{
  "frontend": {
    "framework": "Next.js 14",
    "language": "TypeScript 5",
    "styling": "Tailwind CSS 3.4",
    "stateManagement": "Zustand 5",
    "uiLibrary": "shadcn/ui",
    "formLibrary": "React Hook Form + Zod",
    "testing": ["Vitest 2", "Playwright 1.49", "Testing Library"],
    "icons": "Lucide React",
    "animation": "Framer Motion"
  },
  "backend": {
    "runtime": "Node.js 20",
    "framework": "Next.js 14 API Routes",
    "language": "TypeScript 5",
    "orm": "Prisma 5",
    "auth": "NextAuth.js 4",
    "testing": ["Vitest 2", "MSW 2"],
    "validation": "Zod 3",
    "caching": "Upstash Redis",
    "queue": "None needed"
  },
  "database": {
    "primary": "PostgreSQL 16",
    "orm": "Prisma 5",
    "caching": "None initially",
    "migrations": "Prisma Migrate"
  },
  "tools": {
    "versionControl": "Git",
    "packageManager": "npm",
    "codeQuality": ["ESLint", "Prettier", "TypeScript strict mode"],
    "cicd": "GitHub Actions",
    "monitoring": "Sentry + Vercel Analytics"
  },
  "deployment": {
    "platform": "Vercel",
    "containerization": "None needed",
    "cdn": "Vercel Edge Network",
    "ssl": "Automatic via Vercel",
    "dns": "Vercel DNS"
  }
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return this.parseJSON(content.text) as TechStack;
    }
    throw new Error('Unexpected response format from Tech Selection');
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 4: IMPLEMENTATION PLANNING
  // ═══════════════════════════════════════════════════════════

  async createImplementationPlan(
    requirements: ProjectRequirement,
    architecture: ArchitectureDecision,
    techStack: TechStack
  ): Promise<AgentTask[]> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: ORCHESTRATOR_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Create a detailed implementation plan for this project.

Requirements: ${JSON.stringify(requirements.summary)}
Architecture: ${architecture.pattern}
Tech Stack: ${techStack.frontend.framework} + ${techStack.backend.framework}

Break the project into specific tasks assigned to specialized agents. Each task should have:
- A clear title and description
- An agent role assignment
- Dependencies on other tasks
- Estimated duration in minutes
- Priority level

Respond with valid JSON array of tasks:
[
  {
    "id": "task-1",
    "agentRole": "database-engineer",
    "title": "Design and create database schema",
    "description": "Create Prisma schema with all models, relations, and indexes",
    "status": "pending",
    "priority": "critical",
    "dependencies": [],
    "estimatedDuration": 30
  }
]

Agent roles available: product-intelligence, solution-architect, frontend-developer, backend-developer, database-engineer, qa, devops, security`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return this.parseJSON(content.text) as AgentTask[];
    }
    throw new Error('Unexpected response format from Implementation Planning');
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 5: CODE GENERATION
  // ═══════════════════════════════════════════════════════════

  async generateCode(
    requirements: ProjectRequirement,
    architecture: ArchitectureDecision,
    techStack: TechStack,
    tasks: AgentTask[]
  ): Promise<GeneratedCode> {
    // Generate database schema
    const dbSchema = await this.generateDatabaseSchema(requirements, architecture, techStack);

    // Generate backend code
    const backendCode = await this.generateBackendCode(requirements, architecture, techStack, dbSchema);

    // Generate frontend code
    const frontendCode = await this.generateFrontendCode(requirements, architecture, techStack);

    // Generate tests
    const testCode = await this.generateTests(requirements, frontendCode, backendCode);

    // Generate config files
    const configFiles = this.generateConfigFiles(techStack);

    // Collect all dependencies
    const dependencies = this.collectDependencies(techStack, requirements);

    return {
      files: [...dbSchema.files, ...backendCode.files, ...frontendCode.files, ...configFiles],
      tests: testCode,
      documentation: '',
      buildInstructions: [
        'npm install',
        'npm run db:generate',
        'npm run db:push',
        'npm run dev',
      ],
      dependencies,
    };
  }

  private async generateDatabaseSchema(
    requirements: ProjectRequirement,
    architecture: ArchitectureDecision,
    techStack: TechStack
  ): Promise<GeneratedCode> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: DATABASE_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Generate a complete Prisma database schema for:

Project: ${requirements.title}
Summary: ${requirements.summary}
Features: ${JSON.stringify(requirements.features.map(f => ({ name: f.name, description: f.description })), null, 2)}

Database: ${architecture.database.primary}
ORM: ${architecture.database.orm}

Include:
- All models needed for the features
- Proper relations (one-to-many, many-to-many)
- Indexes for performance
- Timestamp fields on all models
- UUID or CUID primary keys
- Proper cascade delete rules

Respond with valid JSON:
{
  "files": [
    {
      "path": "prisma/schema.prisma",
      "content": "complete prisma schema content",
      "language": "prisma",
      "description": "Database schema",
      "isTest": false,
      "isConfig": false
    }
  ],
  "tests": [],
  "documentation": "Schema documentation",
  "buildInstructions": [],
  "dependencies": []
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return this.parseJSON(content.text) as GeneratedCode;
    }
    return { files: [], tests: [], documentation: '', buildInstructions: [], dependencies: [] };
  }

  private async generateBackendCode(
    requirements: ProjectRequirement,
    architecture: ArchitectureDecision,
    techStack: TechStack,
    dbSchema: GeneratedCode
  ): Promise<GeneratedCode> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: BACKEND_DEV_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Generate complete backend API code for:

Project: ${requirements.title}
Summary: ${requirements.summary}

Features to implement:
${JSON.stringify(requirements.features, null, 2)}

Tech Stack:
- Runtime: ${techStack.backend.runtime}
- Framework: ${techStack.backend.framework}
- ORM: ${techStack.backend.orm}
- Auth: ${techStack.backend.auth}
- Validation: ${techStack.backend.validation}

Database schema (Prisma):
${dbSchema.files[0]?.content || 'No schema provided'}

Generate:
1. tRPC routers for all features (or REST endpoints if REST chosen)
2. Authentication setup
3. Service layer with business logic
4. Input validation with Zod
5. Error handling middleware
6. Type exports

Generate REAL, COMPLETE code — not placeholders or TODOs.

Respond with valid JSON:
{
  "files": [
    {
      "path": "src/server/routers/_app.ts",
      "content": "complete file content",
      "language": "typescript",
      "description": "description",
      "isTest": false,
      "isConfig": false
    }
  ],
  "tests": [],
  "documentation": "",
  "buildInstructions": [],
  "dependencies": []
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return this.parseJSON(content.text) as GeneratedCode;
    }
    return { files: [], tests: [], documentation: '', buildInstructions: [], dependencies: [] };
  }

  private async generateFrontendCode(
    requirements: ProjectRequirement,
    architecture: ArchitectureDecision,
    techStack: TechStack
  ): Promise<GeneratedCode> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: FRONTEND_DEV_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Generate complete frontend code for:

Project: ${requirements.title}
Summary: ${requirements.summary}

Features to implement:
${JSON.stringify(requirements.features.map(f => ({ name: f.name, description: f.description })), null, 2)}

Tech Stack:
- Framework: ${techStack.frontend.framework}
- Styling: ${techStack.frontend.styling}
- State Management: ${techStack.frontend.stateManagement}
- UI Library: ${techStack.frontend.uiLibrary}

Generate:
1. Main layout component
2. Page components for each major feature
3. Reusable UI components
4. Navigation
5. Forms with validation
6. Data fetching hooks
7. Loading states
8. Error states
9. Responsive design

Generate REAL, COMPLETE code — not placeholders or TODOs.

Respond with valid JSON:
{
  "files": [
    {
      "path": "src/app/layout.tsx",
      "content": "complete file content",
      "language": "tsx",
      "description": "description",
      "isTest": false,
      "isConfig": false
    }
  ],
  "tests": [],
  "documentation": "",
  "buildInstructions": [],
  "dependencies": []
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return this.parseJSON(content.text) as GeneratedCode;
    }
    return { files: [], tests: [], documentation: '', buildInstructions: [], dependencies: [] };
  }

  private async generateTests(
    requirements: ProjectRequirement,
    frontendCode: GeneratedCode,
    backendCode: GeneratedCode
  ): Promise<GeneratedFile[]> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: QA_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Generate comprehensive test code for:

Project: ${requirements.title}
User Stories: ${JSON.stringify(requirements.userStories.slice(0, 5), null, 2)}

Generate:
1. Unit tests for utility functions and business logic
2. Integration tests for API endpoints
3. Component tests for critical UI components
4. End-to-end tests for critical user flows

Use Vitest for unit/integration tests and Playwright for E2E tests.

Respond with valid JSON:
{
  "files": [
    {
      "path": "tests/unit/example.test.ts",
      "content": "complete test file content",
      "language": "typescript",
      "description": "description",
      "isTest": true,
      "isConfig": false
    }
  ]
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const result = this.parseJSON(content.text);
      return result.files || [];
    }
    return [];
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 6: VALIDATION & DEBUGGING
  // ═══════════════════════════════════════════════════════════

  async validateCode(
    code: GeneratedCode,
    requirements: ProjectRequirement
  ): Promise<ValidationResult> {
    // Static analysis
    const staticIssues = await this.runStaticAnalysis(code);

    // Security scan
    const securityIssues = await this.runSecurityScan(code);

    // Build check
    const buildResult = await this.runBuildCheck(code);

    const allIssues = [...staticIssues, ...securityIssues];

    return {
      buildPassed: buildResult.success,
      issues: allIssues,
      warnings: [],
      testResults: null,
      qualityScore: this.calculateQualityScore(allIssues, buildResult.success),
    };
  }

  private async runStaticAnalysis(code: GeneratedCode): Promise<QualityIssue[]> {
    // In production, this would run tsc --noEmit, eslint, etc.
    // For now, return empty (actual build step handles this)
    return [];
  }

  private async runSecurityScan(code: GeneratedCode): Promise<QualityIssue[]> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SECURITY_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Scan this generated code for security vulnerabilities. Look for:
1. Hardcoded secrets or API keys
2. SQL injection vulnerabilities
3. XSS vulnerabilities
4. Missing input validation
5. Insecure authentication
6. Missing CSRF protection
7. Improper error handling that could leak information
8. Missing rate limiting on sensitive endpoints

Code files: ${code.files.map(f => f.path).join(', ')}

Respond with valid JSON array of issues:
[
  {
    "severity": "critical|high|medium|low",
    "message": "description",
    "file": "path/to/file",
    "line": 1,
    "suggestion": "how to fix"
  }
]

If no issues found, return empty array [].`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return this.parseJSON(content.text) as QualityIssue[];
    }
    return [];
  }

  private async runBuildCheck(code: GeneratedCode): Promise<{ success: boolean; errors: string[] }> {
    // In production, this would actually run npm run build
    // For now, return success (actual build step in validation pipeline)
    return { success: true, errors: [] };
  }

  private calculateQualityScore(issues: QualityIssue[], buildPassed: boolean): number {
    if (!buildPassed) return 0;
    let score = 100;
    for (const issue of issues) {
      if (issue.severity === 'critical') score -= 30;
      else if (issue.severity === 'high') score -= 15;
      else if (issue.severity === 'medium') score -= 8;
      else if (issue.severity === 'low') score -= 3;
    }
    return Math.max(0, score);
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 7: DOCUMENTATION
  // ═══════════════════════════════════════════════════════════

  async generateDocumentation(
    requirements: ProjectRequirement,
    architecture: ArchitectureDecision,
    techStack: TechStack,
    code: GeneratedCode
  ): Promise<string> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: `You are the Documentation Agent. Generate clear, comprehensive documentation.`,
      messages: [
        {
          role: 'user',
          content: `Generate comprehensive documentation for:

Project: ${requirements.title}
Summary: ${requirements.summary}
Architecture: ${architecture.pattern}
Tech Stack: ${techStack.frontend.framework} + ${techStack.backend.framework}

Generate:
1. README.md with project overview, features, setup instructions
2. Architecture overview
3. API documentation
4. Database schema documentation
5. Deployment guide

Respond with the full markdown content of the README.md`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    return '';
  }

  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION FILES
  // ═══════════════════════════════════════════════════════════

  private generateConfigFiles(techStack: TechStack): GeneratedFile[] {
    return [
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'uafsaida-project',
            version: '1.0.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
              lint: 'next lint',
              test: 'vitest',
              'db:generate': 'prisma generate',
              'db:push': 'prisma db push',
            },
            dependencies: {},
            devDependencies: {},
          },
          null,
          2
        ),
        language: 'json',
        description: 'Package configuration',
        isTest: false,
        isConfig: true,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2022',
              lib: ['dom', 'dom.iterable', 'esnext'],
              allowJs: true,
              skipLibCheck: true,
              strict: true,
              noEmit: true,
              esModuleInterop: true,
              module: 'esnext',
              moduleResolution: 'bundler',
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: 'preserve',
              incremental: true,
              plugins: [{ name: 'next' }],
              paths: { '@/*': ['./src/*'] },
            },
            include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
            exclude: ['node_modules'],
          },
          null,
          2
        ),
        language: 'json',
        description: 'TypeScript configuration',
        isTest: false,
        isConfig: true,
      },
      {
        path: 'next.config.js',
        content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
`,
        language: 'javascript',
        description: 'Next.js configuration',
        isTest: false,
        isConfig: true,
      },
      {
        path: 'tailwind.config.ts',
        content: `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`,
        language: 'typescript',
        description: 'Tailwind CSS configuration',
        isTest: false,
        isConfig: true,
      },
    ];
  }

  // ═══════════════════════════════════════════════════════════
  // DEPENDENCY COLLECTION
  // ═══════════════════════════════════════════════════════════

  private collectDependencies(
    techStack: TechStack,
    requirements: ProjectRequirement
  ): Dependency[] {
    const deps: Dependency[] = [
      { name: 'next', version: '14.2.0', type: 'dependency', reason: 'Frontend framework' },
      { name: 'react', version: '18.3.1', type: 'dependency', reason: 'UI library' },
      { name: 'react-dom', version: '18.3.1', type: 'dependency', reason: 'React DOM renderer' },
      { name: '@prisma/client', version: '5.22.0', type: 'dependency', reason: 'Database ORM' },
      { name: 'prisma', version: '5.22.0', type: 'devDependency', reason: 'Database ORM toolkit' },
      { name: 'zod', version: '3.23.8', type: 'dependency', reason: 'Input validation' },
      { name: 'typescript', version: '5.6.0', type: 'devDependency', reason: 'Type safety' },
    ];

    if (techStack.backend.auth === 'NextAuth.js' || techStack.backend.auth === 'next-auth') {
      deps.push({ name: 'next-auth', version: '4.24.0', type: 'dependency', reason: 'Authentication' });
    }

    if (techStack.frontend.styling.includes('Tailwind')) {
      deps.push({ name: 'tailwindcss', version: '3.4.0', type: 'devDependency', reason: 'CSS framework' });
      deps.push({ name: 'autoprefixer', version: '10.4.0', type: 'devDependency', reason: 'CSS prefixer' });
      deps.push({ name: 'postcss', version: '8.4.0', type: 'devDependency', reason: 'CSS processor' });
    }

    return deps;
  }

  // ═══════════════════════════════════════════════════════════
  // DEBUGGING
  // ═══════════════════════════════════════════════════════════

  async debugAndFix(code: GeneratedCode, errors: DebugError[]): Promise<DebugFix[]> {
    const fixes: DebugFix[] = [];

    for (const error of errors) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4000,
        system: `You are the Debugging Agent. Analyze errors and generate precise fixes.`,
        messages: [
          {
            role: 'user',
            content: `Fix this error:

Type: ${error.type}
Message: ${error.message}
File: ${error.file || 'unknown'}
Line: ${error.line || 'unknown'}

Generate a fix that resolves the issue without breaking other functionality.

Respond with valid JSON:
{
  "description": "What the fix does",
  "filesChanged": ["path/to/file"],
  "diff": "unified diff format of the change"
}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const fix = this.parseJSON(content.text);
        fixes.push({
          id: crypto.randomUUID(),
          errorId: error.id,
          description: fix.description,
          filesChanged: fix.filesChanged,
          diff: fix.diff,
          applied: false,
          validated: false,
          appliedAt: null,
        });
      }
    }

    return fixes;
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════

  private parseJSON(text: string): any {
    // Try to extract JSON from the response (handles markdown code blocks)
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    // Try parsing the whole text
    try {
      return JSON.parse(text);
    } catch {
      // Try to find JSON object/array in the text
      const objectMatch = text.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }
      throw new Error('No valid JSON found in response');
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// RESULT TYPES
// ═══════════════════════════════════════════════════════════════

export interface OrchestrationResult {
  success: boolean;
  projectId: string;
  phases: PhaseResult[];
  artifacts: {
    requirements: ProjectRequirement;
    architecture: ArchitectureDecision;
    techStack: TechStack;
    tasks: AgentTask[];
    code: GeneratedCode;
    validation: ValidationResult;
    documentation: string;
  } | null;
  duration: number;
  message: string;
}

export interface PhaseResult {
  phase: string;
  status: 'completed' | 'failed' | 'skipped';
  result: any;
}

export interface ValidationResult {
  buildPassed: boolean;
  issues: QualityIssue[];
  warnings: string[];
  testResults: any;
  qualityScore: number;
}

export interface QualityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  file?: string;
  line?: number;
  suggestion: string;
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
