// UAFSAIDA — Example Prompts Component
'use client';

const EXAMPLES = [
  {
    title: 'E-commerce Store',
    description: 'Build a modern online store with products, cart, and checkout',
    prompt: 'Build me a modern e-commerce website for selling African fashion. Include product catalog, shopping cart, customer accounts, and an admin dashboard.',
  },
  {
    title: 'School Management',
    description: 'Complete system for managing students, teachers, and classes',
    prompt: 'Create a school management system with student registration, teacher management, attendance tracking, class scheduling, grade management, and parent communication.',
  },
  {
    title: 'Hospital System',
    description: 'Patient registration, appointments, billing, and pharmacy',
    prompt: 'Build a hospital management system with patient registration, appointment scheduling, doctor management, billing, pharmacy inventory, and staff dashboards.',
  },
  {
    title: 'SaaS Platform',
    description: 'Multi-tenant platform with subscriptions and dashboards',
    prompt: 'Create a SaaS platform where users can sign up, upload documents, summarize them using AI, and manage their subscription. Include a dashboard and admin panel.',
  },
  {
    title: 'Church Manager',
    description: 'Member management, attendance, donations, and events',
    prompt: 'Build a mobile app for managing church attendance, member registration, donation tracking, event scheduling, and sermon notes.',
  },
  {
    title: 'Task Manager',
    description: 'Project and team management with real-time updates',
    prompt: 'Create a project management tool with task boards, team collaboration, real-time updates, file sharing, and progress tracking.',
  },
];

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
}

export function ExamplePrompts({ onSelect }: ExamplePromptsProps) {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {EXAMPLES.map((example) => (
        <button
          key={example.title}
          onClick={() => onSelect(example.prompt)}
          className="group rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
        >
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
            {example.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {example.description}
          </p>
        </button>
      ))}
    </div>
  );
}
