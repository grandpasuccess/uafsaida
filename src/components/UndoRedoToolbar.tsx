// UAFSAIDA — Undo/Redo Toolbar Component
'use client';

import { Undo2, Redo2, History } from 'lucide-react';
import { useUndoRedoStore } from '@/lib/undo-redo';

interface UndoRedoToolbarProps {
  onUndo?: () => void;
  onRedo?: () => void;
}

export function UndoRedoToolbar({ onUndo, onRedo }: UndoRedoToolbarProps) {
  const { canUndo, canRedo, undo, redo, getHistory } = useUndoRedoStore();
  const history = getHistory();

  const handleUndo = () => {
    const state = undo();
    if (state && onUndo) onUndo();
  };

  const handleRedo = () => {
    const state = redo();
    if (state && onRedo) onRedo();
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleUndo}
        disabled={!canUndo()}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        onClick={handleRedo}
        disabled={!canRedo()}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4" />
      </button>
      {history.length > 0 && (
        <div className="ml-1 text-xs text-muted-foreground">
          {history.length} step{history.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const { getHistory } = useUndoRedoStore();
  const history = getHistory();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border bg-card p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">History</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <History className="h-4 w-4" />
        </button>
      </div>
      
      {history.length === 0 ? (
        <p className="text-xs text-muted-foreground">No history yet</p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-1">
          {history.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-xs hover:bg-muted"
            >
              <span className="truncate">{entry.description}</span>
              <span className="text-muted-foreground">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
