// UAFSAIDA — Presence Store for Online Users & Cursors
import { create } from 'zustand';

interface PresenceUser {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number } | null;
  lastSeen: number;
}

interface PresenceState {
  users: Map<string, PresenceUser>;
  currentUser: PresenceUser | null;
  
  // Actions
  setCurrentUser: (user: PresenceUser) => void;
  addUser: (user: PresenceUser) => void;
  removeUser: (userId: string) => void;
  updateCursor: (userId: string, cursor: { x: number; y: number }) => void;
  getUserCount: () => number;
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

export const usePresenceStore = create<PresenceState>((set, get) => ({
  users: new Map(),
  currentUser: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  addUser: (user) => set((state) => {
    const users = new Map(state.users);
    users.set(user.id, { ...user, color: COLORS[users.size % COLORS.length] });
    return { users };
  }),

  removeUser: (userId) => set((state) => {
    const users = new Map(state.users);
    users.delete(userId);
    return { users };
  }),

  updateCursor: (userId, cursor) => set((state) => {
    const users = new Map(state.users);
    const user = users.get(userId);
    if (user) {
      users.set(userId, { ...user, cursor, lastSeen: Date.now() });
    }
    return { users };
  }),

  getUserCount: () => get().users.size,
}));
