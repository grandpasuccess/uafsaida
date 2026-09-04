// UAFSAIDA — WebSocket Server for Real-Time Communication
// Provides live updates for agent activity, presence, and collaboration

import { Server as HttpServer } from 'http';
import { WebSocketServer as WSServer, WebSocket as WSWebSocket } from 'ws';
import { parse as parseUrl } from 'url';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface ConnectedClient {
  id: string;
  userId: string;
  socket: WSWebSocket;
  projectId: string | null;
  cursor: { x: number; y: number } | null;
  lastSeen: number;
}

interface WSMessage {
  type: string;
  payload: any;
  sender: string;
  timestamp: number;
}

// Message types
const MessageTypes = {
  JOIN_PROJECT: 'join_project',
  LEAVE_PROJECT: 'leave_project',
  CURSOR_MOVE: 'cursor_move',
  AGENT_UPDATE: 'agent_update',
  PING: 'ping',
  PROJECT_JOINED: 'project_joined',
  PROJECT_LEFT: 'project_left',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  CURSOR_UPDATED: 'cursor_updated',
  AGENT_STATUS_CHANGED: 'agent_status_changed',
  PONG: 'pong',
  ERROR: 'error',
} as const;

// ═══════════════════════════════════════════════════════════════
// WEBSOCKET SERVER
// ═══════════════════════════════════════════════════════════════

export class CollaborationServer {
  private wss: WSServer | null = null;
  private clients: Map<string, ConnectedClient> = new Map();
  private projectClients: Map<string, Set<string>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  initialize(server: HttpServer): WSServer {
    this.wss = new WSServer({ server, path: '/ws' });

    this.wss.on('connection', (socket: WSWebSocket, req: any) => {
      this.handleConnection(socket, req);
    });

    this.heartbeatInterval = setInterval(() => this.heartbeat(), 30000);

    return this.wss;
  }

  private handleConnection(socket: WSWebSocket, req: any): void {
    const clientId = this.generateClientId();
    const userId = this.extractUserId(req);

    const client: ConnectedClient = {
      id: clientId,
      userId,
      socket,
      projectId: null,
      cursor: null,
      lastSeen: Date.now(),
    };

    this.clients.set(clientId, client);

    socket.on('message', (data: Buffer) => {
      this.handleMessage(clientId, data.toString());
    });

    socket.on('close', () => {
      this.handleDisconnect(clientId);
    });

    socket.on('error', (error: Error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.handleDisconnect(clientId);
    });

    this.sendToClient(clientId, {
      type: 'connected',
      payload: { clientId, userId },
      sender: 'system',
      timestamp: Date.now(),
    });
  }

  private handleMessage(clientId: string, rawData: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastSeen = Date.now();

    let message: any;
    try {
      message = JSON.parse(rawData);
    } catch {
      this.sendToClient(clientId, {
        type: MessageTypes.ERROR,
        payload: { message: 'Invalid JSON' },
        sender: 'system',
        timestamp: Date.now(),
      });
      return;
    }

    switch (message.type) {
      case MessageTypes.JOIN_PROJECT:
        this.handleJoinProject(clientId, message.payload?.projectId);
        break;
      case MessageTypes.LEAVE_PROJECT:
        this.handleLeaveProject(clientId);
        break;
      case MessageTypes.CURSOR_MOVE:
        this.handleCursorMove(clientId, message.payload);
        break;
      case MessageTypes.AGENT_UPDATE:
        this.handleAgentUpdate(clientId, message.payload);
        break;
      case MessageTypes.PING:
        this.sendToClient(clientId, {
          type: MessageTypes.PONG,
          payload: {},
          sender: 'system',
          timestamp: Date.now(),
        });
        break;
    }
  }

  private handleJoinProject(clientId: string, projectId: string | undefined): void {
    if (!projectId) return;
    const client = this.clients.get(clientId);
    if (!client) return;

    if (client.projectId) this.handleLeaveProject(clientId);

    client.projectId = projectId;
    if (!this.projectClients.has(projectId)) {
      this.projectClients.set(projectId, new Set());
    }
    this.projectClients.get(projectId)!.add(clientId);

    const projectUsers = this.getProjectUsers(projectId);
    this.sendToClient(clientId, {
      type: MessageTypes.PROJECT_JOINED,
      payload: { projectId, users: projectUsers },
      sender: 'system',
      timestamp: Date.now(),
    });

    this.broadcastToProject(projectId, {
      type: MessageTypes.USER_JOINED,
      payload: { userId: client.userId, clientId },
      sender: clientId,
      timestamp: Date.now(),
    }, clientId);
  }

  private handleLeaveProject(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client || !client.projectId) return;

    this.broadcastToProject(client.projectId, {
      type: MessageTypes.USER_LEFT,
      payload: { userId: client.userId, clientId },
      sender: clientId,
      timestamp: Date.now(),
    }, clientId);

    this.projectClients.get(client.projectId)?.delete(clientId);
    client.projectId = null;
    client.cursor = null;
  }

  private handleCursorMove(clientId: string, payload: any): void {
    const client = this.clients.get(clientId);
    if (!client || !client.projectId) return;

    client.cursor = { x: payload.x, y: payload.y };
    this.broadcastToProject(client.projectId, {
      type: MessageTypes.CURSOR_UPDATED,
      payload: { userId: client.userId, clientId, cursor: client.cursor },
      sender: clientId,
      timestamp: Date.now(),
    }, clientId);
  }

  private handleAgentUpdate(clientId: string, payload: any): void {
    const client = this.clients.get(clientId);
    if (!client || !client.projectId) return;

    this.broadcastToProject(client.projectId, {
      type: MessageTypes.AGENT_STATUS_CHANGED,
      payload: { agent: payload.agent, status: payload.status },
      sender: clientId,
      timestamp: Date.now(),
    });
  }

  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (client.projectId) {
      this.broadcastToProject(client.projectId, {
        type: MessageTypes.USER_LEFT,
        payload: { userId: client.userId, clientId },
        sender: clientId,
        timestamp: Date.now(),
      }, clientId);
      this.projectClients.get(client.projectId)?.delete(clientId);
    }
    this.clients.delete(clientId);
  }

  private heartbeat(): void {
    const now = Date.now();
    for (const [clientId, client] of this.clients) {
      if (now - client.lastSeen > 60000) {
        client.socket.terminate();
        this.handleDisconnect(clientId);
      }
    }
  }

  private sendToClient(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    if (client.socket.readyState === WSWebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
    }
  }

  private broadcastToProject(projectId: string, message: WSMessage, excludeClientId?: string): void {
    const clientIds = this.projectClients.get(projectId);
    if (!clientIds) return;
    for (const clientId of clientIds) {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message);
      }
    }
  }

  private getProjectUsers(projectId: string): Array<{ userId: string; clientId: string; cursor: any }> {
    const clientIds = this.projectClients.get(projectId);
    if (!clientIds) return [];
    const users: Array<{ userId: string; clientId: string; cursor: any }> = [];
    for (const clientId of clientIds) {
      const client = this.clients.get(clientId);
      if (client) {
        users.push({ userId: client.userId, clientId: client.id, cursor: client.cursor });
      }
    }
    return users;
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private extractUserId(req: any): string {
    const url = parseUrl(req.url || '', true);
    const userId = url.query.userId;
    return typeof userId === 'string' ? userId : this.generateClientId();
  }

  getOnlineUsers(projectId: string): number {
    return this.projectClients.get(projectId)?.size || 0;
  }

  getAllOnlineUsers(): number {
    return this.clients.size;
  }

  broadcastAgentUpdate(projectId: string, agent: any, status: string): void {
    this.broadcastToProject(projectId, {
      type: MessageTypes.AGENT_STATUS_CHANGED,
      payload: { agent, status },
      sender: 'system',
      timestamp: Date.now(),
    });
  }

  close(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.wss?.close();
  }
}

export const collaborationServer = new CollaborationServer();
