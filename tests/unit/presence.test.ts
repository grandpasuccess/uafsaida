// UAFSAIDA — WebSocket & Presence Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { CollaborationServer } from '@/lib/websocket';
import { usePresenceStore } from '@/lib/presence';

describe('WebSocket Server', () => {
  it('should create an instance', () => {
    const server = new CollaborationServer();
    expect(server).toBeDefined();
  });

  it('should track online users', () => {
    const server = new CollaborationServer();
    expect(server.getAllOnlineUsers()).toBe(0);
    expect(server.getOnlineUsers('proj-1')).toBe(0);
  });
});

describe('Presence Store', () => {
  beforeEach(() => {
    usePresenceStore.setState({ users: new Map(), currentUser: null });
  });

  it('should add a user', () => {
    const user = { id: 'user-1', name: 'Test User', color: '', cursor: null, lastSeen: Date.now() };
    usePresenceStore.getState().addUser(user);
    
    expect(usePresenceStore.getState().users.size).toBe(1);
  });

  it('should remove a user', () => {
    const user = { id: 'user-1', name: 'Test User', color: '', cursor: null, lastSeen: Date.now() };
    usePresenceStore.getState().addUser(user);
    usePresenceStore.getState().removeUser('user-1');
    
    expect(usePresenceStore.getState().users.size).toBe(0);
  });

  it('should update cursor position', () => {
    const user = { id: 'user-1', name: 'Test User', color: '', cursor: null, lastSeen: Date.now() };
    usePresenceStore.getState().addUser(user);
    usePresenceStore.getState().updateCursor('user-1', { x: 100, y: 200 });
    
    const updatedUser = usePresenceStore.getState().users.get('user-1');
    expect(updatedUser?.cursor).toEqual({ x: 100, y: 200 });
  });

  it('should get user count', () => {
    expect(usePresenceStore.getState().getUserCount()).toBe(0);
    
    const user = { id: 'user-1', name: 'Test User', color: '', cursor: null, lastSeen: Date.now() };
    usePresenceStore.getState().addUser(user);
    
    expect(usePresenceStore.getState().getUserCount()).toBe(1);
  });

  it('should assign colors to users', () => {
    const user1 = { id: 'user-1', name: 'Alice', color: '', cursor: null, lastSeen: Date.now() };
    const user2 = { id: 'user-2', name: 'Bob', color: '', cursor: null, lastSeen: Date.now() };
    usePresenceStore.getState().addUser(user1);
    usePresenceStore.getState().addUser(user2);
    
    expect(usePresenceStore.getState().users.get('user-1')?.color).toBeDefined();
    expect(usePresenceStore.getState().users.get('user-2')?.color).toBeDefined();
    expect(usePresenceStore.getState().users.get('user-1')?.color).not.toBe(
      usePresenceStore.getState().users.get('user-2')?.color
    );
  });

  it('should set current user', () => {
    const user = { id: 'me', name: 'Me', color: '', cursor: null, lastSeen: Date.now() };
    usePresenceStore.getState().setCurrentUser(user);
    
    expect(usePresenceStore.getState().currentUser).toEqual(user);
  });
});
