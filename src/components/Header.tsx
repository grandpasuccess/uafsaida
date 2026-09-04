// UAFSAIDA — Header Component
'use client';

import { Menu, MessageSquare, Monitor, FolderTree, Terminal, Settings, Moon, Sun } from 'lucide-react';
import { useProjectStore } from '@/lib/store';
import { CollaborationPanel } from './CollaborationPanel';

interface HeaderProps {
  onMenuToggle: () => void;
  activePanel: 'chat' | 'preview' | 'files' | 'terminal';
  onPanelChange: (panel: 'chat' | 'preview' | 'files' | 'terminal') => void;
}

export function Header({ onMenuToggle, activePanel, onPanelChange }: HeaderProps) {
  const { currentProject, theme, setTheme } = useProjectStore();

  const panels = [
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
    { id: 'preview' as const, icon: Monitor, label: 'Preview' },
    { id: 'files' as const, icon: FolderTree, label: 'Files' },
    { id: 'terminal' as const, icon: Terminal, label: 'Terminal' },
  ];

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">UAFSAIDA</h1>
        </div>
      </div>

      {/* Center - Panel Tabs */}
      <div className="hidden md:flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
        {panels.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onPanelChange(id)}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activePanel === id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {currentProject && (
          <CollaborationPanel projectId={currentProject.id} projectName={currentProject.name} />
        )}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Settings className="h-5 w-5" />
        </button>
        <div className="ml-2 h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500" />
      </div>
    </header>
  );
}
