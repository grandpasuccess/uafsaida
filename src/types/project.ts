// UAFSAIDA — Project Types

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  stages: ProjectStage[];
  activities: Activity[];
  requirements?: Requirement[];
  architecture?: Architecture;
}

export type ProjectStatus = 
  | 'draft'
  | 'discovering'
  | 'specifying'
  | 'architecting'
  | 'generating'
  | 'preview'
  | 'testing'
  | 'deploying'
  | 'live'
  | 'paused'
  | 'failed';

export interface ProjectStage {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'warning';
  progress: number;
  description?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  details?: string;
  automated: boolean;
  requiresAction?: boolean;
}

export type ActivityType =
  | 'project-created'
  | 'requirement-added'
  | 'requirement-approved'
  | 'schema-generated'
  | 'code-generated'
  | 'test-passed'
  | 'test-failed'
  | 'security-check'
  | 'deployment-started'
  | 'deployment-complete'
  | 'deployment-failed'
  | 'ai-decision'
  | 'human-action-required'
  | 'iteration-completed';

export interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  status: 'pending' | 'approved' | 'rejected' | 'revised';
  category: string;
  acceptanceCriteria: string[];
}

export interface Architecture {
  frontend: string;
  backend: string;
  database: string;
  components: Component[];
  relationships: Relationship[];
}

export interface Component {
  id: string;
  name: string;
  type: 'page' | 'api' | 'service' | 'model' | 'middleware';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  description: string;
}

export interface Relationship {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}
