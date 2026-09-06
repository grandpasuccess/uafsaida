// UAFSAIDA — Project Store

import { useState, useCallback } from 'react';
import { Project, ProjectStage, Activity, Requirement, Architecture } from '@/types/project';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const getDefaultStages = (): ProjectStage[] => [
  { id: 'discover', name: 'Discovery', status: 'pending', progress: 0, description: 'AI asks clarifying questions' },
  { id: 'specify', name: 'Specification', status: 'pending', progress: 0, description: 'Requirements & user stories' },
  { id: 'architect', name: 'Architecture', status: 'pending', progress: 0, description: 'Database & system design' },
  { id: 'implement', name: 'Implementation', status: 'pending', progress: 0, description: 'Code generation' },
  { id: 'verify', name: 'Verification', status: 'pending', progress: 0, description: 'Tests & security checks' },
  { id: 'deploy', name: 'Deployment', status: 'pending', progress: 0, description: 'Deploy to production' },
];

const getInitialActivities = (projectName: string): Activity[] => [
  {
    id: generateId(),
    type: 'project-created',
    message: `Project "${projectName}" created`,
    timestamp: new Date(),
    automated: true,
  },
];

export function useProjectStore() {
  const [projects, setProjects] = useState<Project[]>([]);

  const createProject = useCallback((name: string, description: string): Project => {
    const newProject: Project = {
      id: generateId(),
      name,
      description,
      status: 'draft',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      stages: getDefaultStages(),
      activities: getInitialActivities(name),
    };

    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    ));
  }, []);

  const addActivity = useCallback((projectId: string, activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      timestamp: new Date(),
    };

    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, activities: [...p.activities, newActivity], updatedAt: new Date() }
        : p
    ));
  }, []);

  const updateStage = useCallback((projectId: string, stageId: string, updates: Partial<ProjectStage>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? {
            ...p,
            stages: p.stages.map(s => 
              s.id === stageId ? { ...s, ...updates } : s
            ),
            updatedAt: new Date(),
          }
        : p
    ));
  }, []);

  const setRequirements = useCallback((projectId: string, requirements: Requirement[]) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, requirements, updatedAt: new Date() } : p
    ));
  }, []);

  const setArchitecture = useCallback((projectId: string, architecture: Architecture) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, architecture, updatedAt: new Date() } : p
    ));
  }, []);

  return {
    projects,
    createProject,
    updateProject,
    addActivity,
    updateStage,
    setRequirements,
    setArchitecture,
  };
}
