// UAFSAIDA — Sidebar Component
'use client';

import { Plus, Home, Folder, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjectStore } from '@/lib/store';
import { Project } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { projects, currentProject, setCurrentProject } = useProjectStore();

  const handleNewProject = () => {
    setCurrentProject(null);
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
  };

  return (
    <aside
      className={`relative flex flex-col border-r bg-card transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      }`}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Projects</h2>
        <button
          onClick={handleNewProject}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            Home
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Folder className="h-4 w-4" />
            All Projects
          </button>
        </div>

        {/* Project List */}
        {projects.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent
            </h3>
            <div className="space-y-1">
              {projects.slice(0, 10).map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    currentProject?.id === project.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <HelpCircle className="h-4 w-4" />
          Help
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute left-full top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
    </aside>
  );
}
