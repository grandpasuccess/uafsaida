// UAFSAIDA — Code Generation Engine
// Generates complete, production-ready code from specifications

import Anthropic from '@anthropic-ai/sdk';
import {
  ProjectRequirement,
  ArchitectureDecision,
  TechStack,
  GeneratedCode,
  GeneratedFile,
  Dependency,
  ProjectFile,
} from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const MODEL = 'claude-sonnet-4-20250514';

// ═══════════════════════════════════════════════════════════════
// CODE GENERATION ENGINE
// ═══════════════════════════════════════════════════════════════

export class CodeGenerationEngine {
  private requirements: ProjectRequirement;
  private architecture: ArchitectureDecision;
  private techStack: TechStack;

  constructor(
    requirements: ProjectRequirement,
    architecture: ArchitectureDecision,
    techStack: TechStack
  ) {
    this.requirements = requirements;
    this.architecture = architecture;
    this.techStack = techStack;
  }

  /**
   * Generate a complete application
   */
  async generateApplication(): Promise<GeneratedCode> {
    const [database, backend, frontend, tests, config] = await Promise.all([
      this.generateDatabase(),
      this.generateBackend(),
      this.generateFrontend(),
      this.generateTests(),
      this.generateConfig(),
    ]);

    const allFiles = [
      ...database.files,
      ...backend.files,
      ...frontend.files,
      ...tests.files,
      ...config.files,
    ];

    const allDependencies = [
      ...database.dependencies,
      ...backend.dependencies,
      ...frontend.dependencies,
    ];

    return {
      files: allFiles,
      tests: tests.files,
      documentation: '',
      buildInstructions: this.generateBuildInstructions(),
      dependencies: this.deduplicateDependencies(allDependencies),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // DATABASE GENERATION
  // ═══════════════════════════════════════════════════════════

  private async generateDatabase(): Promise<GeneratedCode> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 12000,
      system: `You are a Database Architect. Generate complete Prisma schemas.
Rules:
- Use PostgreSQL provider
- Include proper relations with onDelete cascade
- Add indexes for frequently queried fields
- Use @default(now()) for timestamps
- Use @id @default(cuid()) for primary keys
- Include enums where appropriate
- Add @updatedAt for auto-updating timestamps`,
      messages: [
        {
          role: 'user',
          content: `Generate a complete Prisma schema for:

Project: ${this.requirements.title}
Features: ${JSON.stringify(this.requirements.features.map(f => ({ name: f.name, description: f.description })), null, 2)}

User Stories: ${JSON.stringify(this.requirements.userStories.slice(0, 8), null, 2)}

Respond with valid JSON:
{
  "files": [
    {
      "path": "prisma/schema.prisma",
      "content": "complete prisma schema",
      "language": "prisma",
      "description": "Database schema",
      "isTest": false,
      "isConfig": false
    },
    {
      "path": "prisma/seed.ts",
      "content": "seed file content",
      "language": "typescript",
      "description": "Seed data",
      "isTest": false,
      "isConfig": false
    }
  ],
  "dependencies": [
    { "name": "@prisma/client", "version": "5.22.0", "type": "dependency", "reason": "Database client" }
  ]
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

  // ═══════════════════════════════════════════════════════════
  // BACKEND GENERATION
  // ═══════════════════════════════════════════════════════════

  private async generateBackend(): Promise<GeneratedCode> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: `You are a Senior Backend Engineer. Generate complete Next.js API routes with tRPC.
Rules:
- Use Next.js 14 App Router
- Use tRPC for type-safe APIs
- Include proper error handling with TRPCError
- Add input validation with Zod
- Implement authentication checks
- Add rate limiting where appropriate
- Include proper TypeScript types
- Follow RESTful conventions`,
      messages: [
        {
          role: 'user',
          content: `Generate complete backend API code for:

Project: ${this.requirements.title}
Features: ${JSON.stringify(this.requirements.features, null, 2)}

Tech Stack:
- Runtime: ${this.techStack.backend.runtime}
- Framework: ${this.techStack.backend.framework}
- ORM: ${this.techStack.backend.orm}
- Auth: ${this.techStack.backend.auth}
- Validation: ${this.techStack.backend.validation}

Generate:
1. tRPC initialization (src/server/trpc.ts)
2. App router (src/server/routers/_app.ts)
3. Feature-specific routers
4. Auth utilities
5. Middleware (auth, logging, error handling)

Respond with valid JSON:
{
  "files": [
    {
      "path": "src/server/trpc.ts",
      "content": "complete file content",
      "language": "typescript",
      "description": "tRPC initialization",
      "isTest": false,
      "isConfig": false
    }
  ],
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

  // ═══════════════════════════════════════════════════════════
  // FRONTEND GENERATION
  // ═══════════════════════════════════════════════════════════

  private async generateFrontend(): Promise<GeneratedCode> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: `You are a Senior Frontend Engineer. Generate complete Next.js + React components.
Rules:
- Use Next.js 14 App Router
- Use TypeScript with strict mode
- Use Tailwind CSS for styling
- Make components responsive (mobile-first)
- Add loading states and error states
- Implement accessibility (ARIA labels, keyboard nav)
- Use React Server Components where appropriate
- Add proper TypeScript interfaces
- Use Zustand for client state`,
      messages: [
        {
          role: 'user',
          content: `Generate complete frontend code for:

Project: ${this.requirements.title}
Summary: ${this.requirements.summary}

Features: ${JSON.stringify(this.requirements.features.map(f => ({ name: f.name, description: f.description })), null, 2)}

Tech Stack:
- Framework: ${this.techStack.frontend.framework}
- Styling: ${this.techStack.frontend.styling}
- State: ${this.techStack.frontend.stateManagement}
- UI Library: ${this.techStack.frontend.uiLibrary}

Generate:
1. Root layout (src/app/layout.tsx)
2. Home page (src/app/page.tsx)
3. Feature pages
4. Reusable components (src/components/)
5. Data fetching hooks
6. Navigation component
7. Footer component

Respond with valid JSON:
{
  "files": [
    {
      "path": "src/app/layout.tsx",
      "content": "complete file content",
      "language": "tsx",
      "description": "Root layout",
      "isTest": false,
      "isConfig": false
    }
  ],
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

  // ═══════════════════════════════════════════════════════════
  // TEST GENERATION
  // ═══════════════════════════════════════════════════════════

  private async generateTests(): Promise<GeneratedCode> {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 12000,
      system: `You are a QA Engineer. Generate comprehensive test suites.
Rules:
- Use Vitest for unit/integration tests
- Use Playwright for E2E tests
- Test happy paths, edge cases, and error cases
- Mock external dependencies
- Use describe/it/expect pattern
- Add proper test descriptions`,
      messages: [
        {
          role: 'user',
          content: `Generate test code for:

Project: ${this.requirements.title}
User Stories: ${JSON.stringify(this.requirements.userStories.slice(0, 5), null, 2)}

Generate:
1. Unit tests for utilities
2. Integration tests for APIs
3. Component tests
4. E2E tests for critical flows

Respond with valid JSON:
{
  "files": [
    {
      "path": "tests/unit/example.test.ts",
      "content": "complete test file",
      "language": "typescript",
      "description": "Unit tests",
      "isTest": true,
      "isConfig": false
    }
  ],
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

  // ═══════════════════════════════════════════════════════════
  // CONFIG GENERATION
  // ═══════════════════════════════════════════════════════════

  private async generateConfig(): Promise<GeneratedCode> {
    const files: GeneratedFile[] = [
      {
        path: 'package.json',
        content: JSON.stringify(this.generatePackageJson(), null, 2),
        language: 'json',
        description: 'Package configuration',
        isTest: false,
        isConfig: true,
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify(this.generateTsConfig(), null, 2),
        language: 'json',
        description: 'TypeScript configuration',
        isTest: false,
        isConfig: true,
      },
      {
        path: 'next.config.js',
        content: this.generateNextConfig(),
        language: 'javascript',
        description: 'Next.js configuration',
        isTest: false,
        isConfig: true,
      },
      {
        path: 'tailwind.config.ts',
        content: this.generateTailwindConfig(),
        language: 'typescript',
        description: 'Tailwind CSS configuration',
        isTest: false,
        isConfig: true,
      },
      {
        path: 'postcss.config.js',
        content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
        language: 'javascript',
        description: 'PostCSS configuration',
        isTest: false,
        isConfig: true,
      },
      {
        path: '.env.example',
        content: this.generateEnvExample(),
        language: 'bash',
        description: 'Environment variables template',
        isTest: false,
        isConfig: true,
      },
      {
        path: '.gitignore',
        content: `node_modules/
.next/
out/
build/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
`,
        language: 'text',
        description: 'Git ignore file',
        isTest: false,
        isConfig: true,
      },
      {
        path: 'vitest.config.ts',
        content: `import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
`,
        language: 'typescript',
        description: 'Vitest configuration',
        isTest: false,
        isConfig: true,
      },
    ];

    return {
      files,
      tests: [],
      documentation: '',
      buildInstructions: [],
      dependencies: [],
    };
  }

  // ═══════════════════════════════════════════════════════════
  // PACKAGE.JSON GENERATOR
  // ═══════════════════════════════════════════════════════════

  private generatePackageJson() {
    const deps: Record<string, string> = {
      next: '14.2.0',
      react: '18.3.1',
      'react-dom': '18.3.1',
      '@prisma/client': '5.22.0',
      zod: '3.23.8',
      zustand: '5.0.1',
      '@trpc/client': '10.45.0',
      '@trpc/server': '10.45.0',
      '@trpc/react-query': '10.45.0',
      '@tanstack/react-query': '4.36.0',
      'superjson': '2.2.1',
      'lucide-react': '0.460.0',
      'clsx': '2.1.1',
      'tailwind-merge': '2.5.4',
    };

    const devDeps: Record<string, string> = {
      typescript: '5.6.0',
      '@types/node': '22.9.0',
      '@types/react': '18.3.12',
      '@types/react-dom': '18.3.1',
      prisma: '5.22.0',
      tailwindcss: '3.4.0',
      autoprefixer: '10.4.0',
      postcss: '8.4.0',
      vitest: '2.1.0',
      eslint: '8.57.0',
      'eslint-config-next': '14.2.0',
    };

    if (this.techStack.backend.auth.includes('next-auth')) {
      deps['next-auth'] = '4.24.0';
    }

    return {
      name: this.requirements.title.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint',
        test: 'vitest',
        'test:watch': 'vitest --watch',
        'test:coverage': 'vitest --coverage',
        'db:generate': 'prisma generate',
        'db:push': 'prisma db push',
        'db:migrate': 'prisma migrate dev',
        'db:studio': 'prisma studio',
        'db:seed': 'tsx prisma/seed.ts',
      },
      dependencies: deps,
      devDependencies: devDeps,
    };
  }

  private generateTsConfig() {
    return {
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
    };
  }

  private generateNextConfig(): string {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
`;
  }

  private generateTailwindConfig(): string {
    return `import type { Config } from 'tailwindcss';

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
`;
  }

  private generateEnvExample(): string {
    return `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
`;
  }

  // ═══════════════════════════════════════════════════════════
  // BUILD INSTRUCTIONS
  // ═══════════════════════════════════════════════════════════

  private generateBuildInstructions(): string[] {
    return [
      'npm install',
      'cp .env.example .env.local  # Fill in your values',
      'npm run db:generate',
      'npm run db:push',
      'npm run db:seed  # Optional: add sample data',
      'npm run dev',
    ];
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════

  private deduplicateDependencies(deps: Dependency[]): Dependency[] {
    const seen = new Map<string, Dependency>();
    for (const dep of deps) {
      if (!seen.has(dep.name)) {
        seen.set(dep.name, dep);
      }
    }
    return Array.from(seen.values());
  }

  private parseJSON(text: string): any {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    try {
      return JSON.parse(text);
    } catch {
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
