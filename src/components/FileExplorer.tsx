// UAFSAIDA — File Explorer Component
'use client';

import { useState } from 'react';
import { Project, ProjectFile } from '@/types';
import { useProjectStore } from '@/lib/store';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, RefreshCw, Search } from 'lucide-react';

interface FileExplorerProps {
  project: Project;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  file?: ProjectFile;
}

export function FileExplorer({ project }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [searchQuery, setSearchQuery] = useState('');
  const { files, activeFile, setActiveFile } = useProjectStore();

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setExpandedFolders(next);
  };

  const buildFileTree = (files: ProjectFile[]): FileNode => {
    const root: FileNode = { name: 'root', path: '/', type: 'folder', children: [] };

    for (const file of files) {
      const parts = file.path.split('/').filter(Boolean);
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const currentPath = '/' + parts.slice(0, i + 1).join('/');

        if (!current.children) current.children = [];

        let existing = current.children.find((c) => c.name === part);
        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            type: isLast ? 'file' : 'folder',
            children: isLast ? undefined : [],
            file: isLast ? file : undefined,
          };
          current.children.push(existing);
        }
        current = existing;
      }
    }

    return root;
  };

  const fileTree = buildFileTree(files);

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    const isFolder = node.type === 'folder';
    const isActive = activeFile?.path === node.path;

    return (
      <div key={node.path}>
        <button
          onClick={() => {
            if (isFolder) toggleFolder(node.path);
            else if (node.file) setActiveFile(node.file);
          }}
          className={`flex w-full items-center gap-1 px-2 py-1 text-sm transition-colors ${
            isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {isFolder ? (
            <>
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              {isExpanded ? <FolderOpen className="h-4 w-4 text-yellow-500" /> : <Folder className="h-4 w-4 text-yellow-500" />}
            </>
          ) : (
            <>
              <span className="w-3" />
              <File className="h-4 w-4 text-muted-foreground" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isFolder && isExpanded && node.children?.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b p-2">
        <h3 className="text-sm font-medium">Explorer</h3>
        <div className="flex gap-1">
          <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground">
            <Plus className="h-4 w-4" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b p-2">
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Folder className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No files yet</p>
            <p className="text-xs">Start a project to generate files</p>
          </div>
        ) : (
          fileTree.children?.map((node) => renderNode(node))
        )}
      </div>
    </div>
  );
}
