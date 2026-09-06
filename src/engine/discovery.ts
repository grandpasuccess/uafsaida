// UAFSAIDA — Discovery Engine

import { Requirement } from '../types/project';

const generateId = () => `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

interface DiscoveryQuestion {
  id: string;
  question: string;
  category: string;
  options?: string[];
  required: boolean;
}

export function generateDiscoveryQuestions(prompt: string): DiscoveryQuestion[] {
  const lower = prompt.toLowerCase();
  const questions: DiscoveryQuestion[] = [];

  // Always ask about users
  questions.push({
    id: 'users',
    question: 'Who will use this application?',
    category: 'users',
    options: ['Admins only', 'Staff & admins', 'Staff, admins & customers', 'Public users', 'Students & teachers'],
    required: true,
  });

  // Always ask about authentication
  questions.push({
    id: 'auth',
    question: 'What authentication method do you need?',
    category: 'authentication',
    options: ['Email & password', 'Email + Google', 'Email + Google + Phone', 'SSO/Enterprise', 'No authentication'],
    required: true,
  });

  // Detect domain-specific questions
  if (lower.includes('school') || lower.includes('education') || lower.includes('student')) {
    questions.push({
      id: 'grading',
      question: 'What grading system do you use?',
      category: 'domain',
      options: ['Percentage (0-100)', 'Letter grades (A-F)', 'GPA scale', 'Custom'],
      required: true,
    });
    questions.push({
      id: 'parents',
      question: 'Do parents need access?',
      category: 'domain',
      options: ['Yes, full access', 'Yes, limited view', 'No'],
      required: false,
    });
  }

  if (lower.includes('ecommerce') || lower.includes('store') || lower.includes('shop')) {
    questions.push({
      id: 'payments',
      question: 'What payment methods do you need?',
      category: 'payments',
      options: ['Card only', 'Card + Bank transfer', 'Card + Cash on delivery', 'All methods'],
      required: true,
    });
    questions.push({
      id: 'inventory',
      question: 'Do you need inventory management?',
      category: 'domain',
      options: ['Yes, full tracking', 'Yes, basic stock count', 'No'],
      required: false,
    });
  }

  if (lower.includes('hospital') || lower.includes('health') || lower.includes('clinic')) {
    questions.push({
      id: 'patients',
      question: 'What patient data do you need to store?',
      category: 'domain',
      options: ['Basic info only', 'Medical history', 'Full records + prescriptions', 'All + lab results'],
      required: true,
    });
    questions.push({
      id: 'privacy',
      question: 'What privacy level is required?',
      category: 'security',
      options: ['Standard', 'HIPAA-compliant', 'End-to-end encrypted'],
      required: true,
    });
  }

  if (lower.includes('crm') || lower.includes('customer')) {
    questions.push({
      id: 'pipeline',
      question: 'What sales pipeline stages do you need?',
      category: 'domain',
      options: ['Simple (Lead → Customer)', 'Standard (5 stages)', 'Custom'],
      required: false,
    });
  }

  // Always ask about notifications
  questions.push({
    id: 'notifications',
    question: 'What notifications do you need?',
    category: 'features',
    options: ['Email only', 'Email + SMS', 'Email + SMS + Push', 'No notifications'],
    required: false,
  });

  // Always ask about deployment
  questions.push({
    id: 'platform',
    question: 'What platforms do you need?',
    category: 'deployment',
    options: ['Web only', 'Web + Mobile Web', 'Web + iOS + Android'],
    required: true,
  });

  return questions;
}

export function generateRequirements(prompt: string, answers: Record<string, string>): Requirement[] {
  const lower = prompt.toLowerCase();
  const requirements: Requirement[] = [];

  // Core requirements based on prompt
  if (lower.includes('school') || lower.includes('education')) {
    requirements.push(
      { id: generateId(), title: 'Student Registration', description: 'Admin can register new students with personal and academic details', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Admin can create student records', 'Student ID auto-generated', 'Photo upload supported'] },
      { id: generateId(), title: 'Teacher Management', description: 'Add, edit, and manage teacher profiles and assignments', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Teacher profiles include qualifications', 'Assign teachers to classes', 'Track teacher availability'] },
      { id: generateId(), title: 'Attendance Tracking', description: 'Record and view student attendance by class and date', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Daily attendance entry', 'Attendance reports by class', 'Absent notifications'] },
      { id: generateId(), title: 'Grade Management', description: 'Enter, calculate, and report student grades', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Grade entry by subject', 'Automatic GPA calculation', 'Report card generation'] },
      { id: generateId(), title: 'Class Scheduling', description: 'Create and manage class timetables', priority: 'should', status: 'pending', category: 'Core', acceptanceCriteria: ['Weekly timetable view', 'Conflict detection', 'Room assignment'] },
    );

    if (answers.parents === 'Yes, full access' || answers.parents === 'Yes, limited view') {
      requirements.push({
        id: generateId(),
        title: 'Parent Portal',
        description: 'Parents can view their child\'s progress, attendance, and grades',
        priority: 'should',
        status: 'pending',
        category: 'Portal',
        acceptanceCriteria: ['Parent login', 'View child grades', 'View attendance', 'Teacher communication'],
      });
    }
  }

  if (lower.includes('ecommerce') || lower.includes('store') || lower.includes('shop')) {
    requirements.push(
      { id: generateId(), title: 'Product Catalog', description: 'Browse, search, and filter products by category, price, and attributes', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Product listing page', 'Category filters', 'Search functionality', 'Product detail page'] },
      { id: generateId(), title: 'Shopping Cart', description: 'Add, remove, and modify items in cart with persistent storage', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Add to cart', 'Update quantities', 'Cart persistence', 'Price calculation'] },
      { id: generateId(), title: 'Checkout Flow', description: 'Complete purchase with shipping and payment', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Shipping address entry', 'Payment selection', 'Order confirmation', 'Email receipt'] },
      { id: generateId(), title: 'Order Management', description: 'View, track, and manage order status', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Order history', 'Status tracking', 'Cancel order option', 'Refund request'] },
      { id: generateId(), title: 'User Accounts', description: 'Registration, login, profile management', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Email registration', 'Login/logout', 'Profile edit', 'Password reset'] },
    );
  }

  if (lower.includes('crm') || lower.includes('customer')) {
    requirements.push(
      { id: generateId(), title: 'Contact Management', description: 'Store and organize customer contact information', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Contact profiles', 'Search and filter', 'Import/export'] },
      { id: generateId(), title: 'Deal Pipeline', description: 'Track deals through sales stages', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Pipeline view', 'Stage transitions', 'Deal value tracking', 'Win/loss reporting'] },
      { id: generateId(), title: 'Task Management', description: 'Create and assign tasks to team members', priority: 'must', status: 'pending', category: 'Core', acceptanceCriteria: ['Task creation', 'Due dates', 'Assignments', 'Status tracking'] },
      { id: generateId(), title: 'Activity Log', description: 'Track all interactions with contacts and deals', priority: 'should', status: 'pending', category: 'Core', acceptanceCriteria: ['Timeline view', 'Filter by type', 'Export history'] },
    );
  }

  // Add authentication requirements based on answer
  if (answers.auth) {
    const authReqs: Requirement[] = [];
    
    if (answers.auth.includes('Email')) {
      authReqs.push({
        id: generateId(),
        title: 'Email Authentication',
        description: 'Users can register and login with email and password',
        priority: 'must',
        status: 'pending',
        category: 'Authentication',
        acceptanceCriteria: ['Email registration', 'Password requirements', 'Login/logout', 'Session management'],
      });
    }
    
    if (answers.auth.includes('Google')) {
      authReqs.push({
        id: generateId(),
        title: 'Google OAuth',
        description: 'Users can login with their Google account',
        priority: 'should',
        status: 'pending',
        category: 'Authentication',
        acceptanceCriteria: ['Google login button', 'Account linking', 'Profile sync'],
      });
    }

    requirements.push(...authReqs);
  }

  // Add notification requirements
  if (answers.notifications && answers.notifications !== 'No notifications') {
    requirements.push({
      id: generateId(),
      title: 'Notification System',
      description: `Send notifications via ${answers.notifications.toLowerCase()}`,
      priority: 'could',
      status: 'pending',
      category: 'Notifications',
      acceptanceCriteria: ['Notification preferences', 'Delivery tracking', 'Notification history'],
    });
  }

  return requirements;
}
