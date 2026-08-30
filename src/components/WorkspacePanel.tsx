// UAFSAIDA — Workspace Panel Component
'use client';

import { Project } from '@/types';
import { useProjectStore } from '@/lib/store';
import { FileExplorer } from './FileExplorer';
import { PreviewPanel } from './PreviewPanel';
import { TerminalPanel } from './TerminalPanel';

interface WorkspacePanelProps {
  project: Project;
  activePanel: 'chat' | 'preview' | 'files' | 'terminal';
}

export function WorkspacePanel({ project, activePanel }: WorkspacePanelProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {activePanel === 'preview' && <PreviewPanel project={project} />}
      {activePanel === 'files' && <FileExplorer project={project} />}
      {activePanel === 'terminal' && <TerminalPanel project={project} />}
    </div>
  );
}
