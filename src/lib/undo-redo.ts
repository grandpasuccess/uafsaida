// UAFSAIDA — Undo/Redo System
import { create } from 'zustand';

interface HistoryEntry {
  id: string;
  timestamp: number;
  description: string;
  state: any;
}

interface UndoRedoState {
  past: HistoryEntry[];
  present: HistoryEntry | null;
  future: HistoryEntry[];
  
  // Actions
  pushState: (state: any, description: string) => void;
  undo: () => any | null;
  redo: () => any | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
  getHistory: () => HistoryEntry[];
}

export const useUndoRedoStore = create<UndoRedoState>((set, get) => ({
  past: [],
  present: null,
  future: [],

  pushState: (state, description) => set((current) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      description,
      state: JSON.parse(JSON.stringify(state)), // Deep clone
    };

    return {
      past: current.present 
        ? [...current.past, current.present].slice(-50) // Keep last 50 states
        : current.past,
      present: entry,
      future: [], // Clear future on new action
    };
  }),

  undo: () => {
    const { past, present, future } = get();
    if (past.length === 0 || !present) return null;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      past: newPast,
      present: previous,
      future: [present, ...future].slice(0, 50),
    });

    return previous.state;
  },

  redo: () => {
    const { past, present, future } = get();
    if (future.length === 0 || !present) return null;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, present].slice(-50),
      present: next,
      future: newFuture,
    });

    return next.state;
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clear: () => set({ past: [], present: null, future: [] }),

  getHistory: () => {
    const { past, present, future } = get();
    return [...past, ...(present ? [present] : []), ...future];
  },
}));
