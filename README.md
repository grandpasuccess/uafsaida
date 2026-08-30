# UAFSAIDA — Universal AI Software Development Platform

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Fill in your API keys in .env.local

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

Visit http://localhost:3000

## Architecture

UAFSAIDA uses a multi-agent architecture coordinated by a central orchestration engine.

### System Layers

1. **User Interaction Layer** — Chat, voice, file upload, visual preview
2. **AI Orchestration Engine** — Intent analysis, planning, task routing, validation
3. **Multi-Agent System** — Specialized agents for each development phase
4. **Code Generation Engine** — Generates complete, production-ready code
5. **Execution & Validation Layer** — Sandbox, build, test, security scan, deploy
6. **Data & Infrastructure Layer** — PostgreSQL, file system, Git, Docker

### Agent Roster

| Agent | Responsibility |
|-------|---------------|
| Product Intelligence | Requirements analysis, PRD generation |
| Solution Architect | System architecture, technology selection |
| Frontend Developer | UI implementation, component architecture |
| Backend Developer | API implementation, business logic |
| Database Engineer | Schema design, migrations |
| QA Engineer | Test generation, validation |
| DevOps Engineer | Deployment, CI/CD |
| Security Engineer | Security analysis, vulnerability scanning |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/chat | Process chat message |
| POST | /api/chat/stream | Streaming chat (SSE) |
| GET | /api/projects | List projects |
| POST | /api/projects | Create project |
| PATCH | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |

## Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| NEXTAUTH_URL | Application URL |
| NEXTAUTH_SECRET | NextAuth.js secret |
| GITHUB_CLIENT_ID | GitHub OAuth app ID |
| GITHUB_CLIENT_SECRET | GitHub OAuth app secret |
| GOOGLE_CLIENT_ID | Google OAuth app ID |
| GOOGLE_CLIENT_SECRET | Google OAuth app secret |
| ANTHROPIC_API_KEY | Anthropic API key |

## Development

### Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js 14 API Routes
- **Database:** PostgreSQL, Prisma ORM
- **AI:** Anthropic Claude API
- **Auth:** NextAuth.js
- **Real-time:** Server-Sent Events

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── login/             # Login page
│   └── workspace/         # Main workspace
├── components/            # UI components
├── agents/                # Multi-agent framework
├── engine/                # AI engines
│   ├── orchestrator.ts    # Central orchestration
│   ├── code-generation.ts # Code generation
│   ├── debugging.ts       # Autonomous debugging
│   └── deployment.ts      # Deployment engine
├── lib/                   # Utilities
├── services/              # Business logic
├── types/                 # TypeScript types
└── middleware.ts          # Auth middleware
```

## License

MIT
