// UAFSAIDA — Project Templates Library
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  prompt: string;
  features: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  techStack: {
    frontend: string;
    backend: string;
    database: string;
  };
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Full-featured online store with products, cart, checkout, and admin dashboard',
    category: 'Business',
    icon: '🛒',
    prompt: 'Build a modern e-commerce website with product catalog, shopping cart, secure checkout, customer accounts, order management, and an admin dashboard for inventory and sales.',
    features: ['Product catalog', 'Shopping cart', 'Secure checkout', 'Customer accounts', 'Order management', 'Admin dashboard', 'Inventory tracking', 'Payment integration'],
    complexity: 'complex',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
  {
    id: 'saas',
    name: 'SaaS Platform',
    description: 'Multi-tenant software platform with subscriptions, dashboards, and team management',
    category: 'Business',
    icon: '☁️',
    prompt: 'Create a SaaS platform where users can sign up, choose a subscription plan, access a dashboard, manage their team, and use the core product features. Include billing and usage analytics.',
    features: ['User authentication', 'Subscription billing', 'Team management', 'Usage analytics', 'Role-based access', 'API access', 'Webhook integrations'],
    complexity: 'complex',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
  {
    id: 'lms',
    name: 'Learning Management System',
    description: 'Online education platform with courses, lessons, quizzes, and progress tracking',
    category: 'Education',
    icon: '📚',
    prompt: 'Build a learning management system with course creation, video lessons, quizzes, assignments, student progress tracking, certificates, and an instructor dashboard.',
    features: ['Course creation', 'Video lessons', 'Quizzes & assignments', 'Progress tracking', 'Certificates', 'Instructor dashboard', 'Student portal', 'Discussion forums'],
    complexity: 'complex',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
  {
    id: 'crm',
    name: 'CRM System',
    description: 'Customer relationship management with contacts, deals, and sales pipeline',
    category: 'Business',
    icon: '👥',
    prompt: 'Create a CRM system for managing contacts, tracking deals through a sales pipeline, scheduling meetings, sending follow-up emails, and generating sales reports.',
    features: ['Contact management', 'Sales pipeline', 'Deal tracking', 'Meeting scheduler', 'Email integration', 'Sales reports', 'Task management', 'Activity timeline'],
    complexity: 'moderate',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
  {
    id: 'hospital',
    name: 'Hospital Management',
    description: 'Complete hospital system with patients, appointments, billing, and pharmacy',
    category: 'Healthcare',
    icon: '🏥',
    prompt: 'Build a hospital management system with patient registration, appointment scheduling, doctor management, electronic health records, billing, pharmacy inventory, and staff dashboards.',
    features: ['Patient registration', 'Appointment scheduling', 'Doctor management', 'Electronic health records', 'Billing system', 'Pharmacy inventory', 'Staff dashboards', 'Lab results'],
    complexity: 'complex',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
  {
    id: 'school',
    name: 'School Management',
    description: 'School administration with students, teachers, classes, and grades',
    category: 'Education',
    icon: '🏫',
    prompt: 'Create a school management system with student registration, teacher management, class scheduling, attendance tracking, grade management, parent communication, and an administrator dashboard.',
    features: ['Student registration', 'Teacher management', 'Class scheduling', 'Attendance tracking', 'Grade management', 'Parent portal', 'Fee management', 'Report cards'],
    complexity: 'moderate',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
  {
    id: 'booking',
    name: 'Booking Platform',
    description: 'Appointment and reservation system with calendar and notifications',
    category: 'Business',
    icon: '📅',
    prompt: 'Build a booking platform where users can browse services, book appointments, manage reservations, receive confirmations, and get reminders. Include a provider dashboard.',
    features: ['Service browsing', 'Online booking', 'Calendar management', 'Email confirmations', 'SMS reminders', 'Provider dashboard', 'Payment processing', 'Reviews'],
    complexity: 'moderate',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
  {
    id: 'portfolio',
    name: 'Portfolio Website',
    description: 'Personal portfolio with projects, blog, and contact form',
    category: 'Personal',
    icon: '🎨',
    prompt: 'Create a personal portfolio website with an about section, project gallery, blog, skills showcase, resume download, and a contact form.',
    features: ['About section', 'Project gallery', 'Blog', 'Skills showcase', 'Resume download', 'Contact form', 'Dark mode', 'Responsive design'],
    complexity: 'simple',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'SQLite' },
  },
  {
    id: 'blog',
    name: 'Blog Platform',
    description: 'Content management system with posts, categories, and comments',
    category: 'Content',
    icon: '📝',
    prompt: 'Build a blog platform with rich text editing, categories, tags, comments, search, RSS feed, and an admin panel for content management.',
    features: ['Rich text editor', 'Categories & tags', 'Comments', 'Search', 'RSS feed', 'Admin panel', 'SEO optimization', 'Social sharing'],
    complexity: 'moderate',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
  {
    id: 'church',
    name: 'Church Manager',
    description: 'Church administration with members, events, donations, and sermons',
    category: 'Non-Profit',
    icon: '⛪',
    prompt: 'Create a church management app with member registration, event scheduling, donation tracking, sermon notes, attendance tracking, and volunteer management.',
    features: ['Member registration', 'Event scheduling', 'Donation tracking', 'Sermon notes', 'Attendance tracking', 'Volunteer management', 'Announcements', 'Small groups'],
    complexity: 'moderate',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
  {
    id: 'restaurant',
    name: 'Restaurant Manager',
    description: 'Restaurant system with menu, orders, tables, and kitchen display',
    category: 'Business',
    icon: '🍽️',
    prompt: 'Build a restaurant management system with digital menu, table reservations, order management, kitchen display, inventory tracking, and staff scheduling.',
    features: ['Digital menu', 'Table reservations', 'Order management', 'Kitchen display', 'Inventory tracking', 'Staff scheduling', 'Sales reports', 'Customer loyalty'],
    complexity: 'moderate',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
  {
    id: 'fitness',
    name: 'Fitness Tracker',
    description: 'Workout tracking with exercises, progress, and nutrition',
    category: 'Health',
    icon: '💪',
    prompt: 'Create a fitness tracking app with workout logging, exercise library, progress charts, nutrition tracking, goal setting, and social features.',
    features: ['Workout logging', 'Exercise library', 'Progress charts', 'Nutrition tracking', 'Goal setting', 'Social features', 'Workout plans', 'Body measurements'],
    complexity: 'moderate',
    techStack: { frontend: 'Next.js + Tailwind', backend: 'Next.js API Routes', database: 'PostgreSQL' },
  },
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter(t => t.category === category);
}

export function getAllCategories(): string[] {
  return [...new Set(PROJECT_TEMPLATES.map(t => t.category))];
}
