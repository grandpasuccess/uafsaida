// UAFSAIDA — State Management Store
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Project,
  ChatMessage,
  Agent,
  AgentTask,
  ProjectFile,
  Session,
  ProjectMemory,
} from '@/types';

// ═══════════════════════════════════════════════════════════════
// PROJECT STORE
// ═══════════════════════════════════════════════════════════════

interface ProjectState {
  // Current project
  currentProject: Project | null;
  projects: Project[];

  // Session
  currentSession: Session | null;
  messages: ChatMessage[];

  // Agents
  agents: Agent[];
  tasks: AgentTask[];

  // Files
  files: ProjectFile[];
  activeFile: ProjectFile | null;

  // UI State
  isGenerating: boolean;
  isSidebarOpen: boolean;
  activePanel: 'chat' | 'preview' | 'files' | 'terminal';
  mode: 'beginner' | 'advanced';
  theme: 'light' | 'dark' | 'system';

  // Memory
  memory: ProjectMemory;

  // Actions
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;

  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;

  setTasks: (tasks: AgentTask[]) => void;
  updateTask: (id: string, updates: Partial<AgentTask>) => void;

  setFiles: (files: ProjectFile[]) => void;
  addFile: (file: ProjectFile) => void;
  updateFile: (id: string, updates: Partial<ProjectFile>) => void;
  deleteFile: (id: string) => void;
  setActiveFile: (file: ProjectFile | null) => void;

  setGenerating: (isGenerating: boolean) => void;
  setActivePanel: (panel: 'chat' | 'preview' | 'files' | 'terminal') => void;
  setMode: (mode: 'beginner' | 'advanced') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  addToMemory: (category: any, key: string, value: string, importance: 'critical' | 'high' | 'medium' | 'low') => void;

  // Reset
  reset: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProject: null,
      projects: [],
      currentSession: null,
      messages: [],
      agents: [],
      tasks: [],
      files: [],
      activeFile: null,
      isGenerating: false,
      isSidebarOpen: true,
      activePanel: 'chat',
      mode: 'beginner',
      theme: 'system',
      memory: {
        requirements: [],
        architecture: [],
        code: [],
        bugs: [],
        user: [],
        decisions: [],
        lessonsLearned: [],
      },

      // Project actions
      setCurrentProject: (project) => set({ currentProject: project }),
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...updates } : state.currentProject,
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        })),

      // Message actions
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
      clearMessages: () => set({ messages: [] }),

      // Agent actions
      setAgents: (agents) => set({ agents }),
      updateAgent: (id, updates) =>
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      // Task actions
      setTasks: (tasks) => set({ tasks }),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      // File actions
      setFiles: (files) => set({ files }),
      addFile: (file) => set((state) => ({ files: [...state.files, file] })),
      updateFile: (id, updates) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
          activeFile: state.activeFile?.id === id ? { ...state.activeFile, ...updates } : state.activeFile,
        })),
      deleteFile: (id) =>
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
          activeFile: state.activeFile?.id === id ? null : state.activeFile,
        })),
      setActiveFile: (file) => set({ activeFile: file }),

      // UI actions
      setGenerating: (isGenerating) => set({ isGenerating }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      setMode: (mode) => set({ mode }),
      setTheme: (theme) => set({ theme }),

      // Memory actions
      addToMemory: (category, key, value, importance) =>
        set((state) => ({
          memory: {
            ...state.memory,
            [category]: [
              ...(state.memory[category as keyof ProjectMemory] as any[]),
              {
                id: crypto.randomUUID(),
                category,
                key,
                value,
                importance,
                relatedEntries: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
          },
        })),

      // Reset
      reset: () =>
        set({
          currentProject: null,
          currentSession: null,
          messages: [],
          agents: [],
          tasks: [],
          files: [],
          activeFile: null,
          isGenerating: false,
        }),
    }),
    {
      name: 'uafsaida-storage',
      partialize: (state) => ({
        projects: state.projects,
        mode: state.mode,
        theme: state.theme,
        memory: state.memory,
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════
// UI STORE
// ═══════════════════════════════════════════════════════════════

interface UIState {
  toast: { title: string; description?: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
  modal: { isOpen: boolean; title: string; content: React.ReactNode } | null;
  showToast: (toast: { title: string; description?: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toast: null,
  modal: null,
  showToast: (toast) => {
    set({ toast });
    setTimeout(() => set({ toast: null }), 5000);
  },
  hideToast: () => set({ toast: null }),
}));
