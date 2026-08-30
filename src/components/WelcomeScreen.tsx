// UAFSAIDA — Welcome Screen Component
'use client';

import { Sparkles, Code, Globe, Smartphone, Database, Shield, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onNewProject: () => void;
}

export function WelcomeScreen({ onNewProject }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-8">
      <div className="max-w-4xl text-center">
        {/* Hero */}
        <div className="mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              UAFSAIDA
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Build complete software applications using natural language. Describe what you want — we'll handle everything else.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Code, title: 'Code Generation', desc: 'Full-stack apps from prompts' },
            { icon: Globe, title: 'Web & Mobile', desc: 'Responsive, PWA, native' },
            { icon: Database, title: 'Database Design', desc: 'PostgreSQL with Prisma' },
            { icon: Shield, title: 'Security First', desc: 'OWASP compliant' },
            { icon: Zap, title: 'Instant Deploy', desc: 'One-click to production' },
            { icon: Smartphone, title: 'Cross-Platform', desc: 'Works everywhere' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-card p-4 text-left shadow-sm">
              <Icon className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onNewProject}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        >
          <Sparkles className="h-5 w-5" />
          Start Building
        </button>
        <p className="mt-4 text-sm text-muted-foreground">
          No coding required. Just describe your idea.
        </p>
      </div>
    </div>
  );
}
