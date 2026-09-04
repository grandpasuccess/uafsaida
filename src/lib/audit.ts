// UAFSAIDA — Audit Logging System
import { NextRequest } from 'next/server';

export enum AuditAction {
  // Auth events
  USER_LOGIN = 'user:login',
  USER_LOGOUT = 'user:logout',
  USER_CREATED = 'user:created',
  USER_UPDATED = 'user:updated',
  USER_DELETED = 'user:deleted',

  // Project events
  PROJECT_CREATED = 'project:created',
  PROJECT_UPDATED = 'project:updated',
  PROJECT_DELETED = 'project:deleted',
  PROJECT_SHARED = 'project:shared',
  PROJECT_EXPORTED = 'project:exported',

  // File events
  FILE_CREATED = 'file:created',
  FILE_UPDATED = 'file:updated',
  FILE_DELETED = 'file:deleted',
  FILE_DOWNLOADED = 'file:downloaded',

  // Agent events
  AGENT_STARTED = 'agent:started',
  AGENT_COMPLETED = 'agent:completed',
  AGENT_FAILED = 'agent:failed',

  // System events
  SETTINGS_CHANGED = 'settings:changed',
  API_KEY_CREATED = 'api_key:created',
  API_KEY_DELETED = 'api_key:deleted',
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];

  async log(
    userId: string,
    action: AuditAction,
    resource: string,
    details?: Record<string, any>,
    request?: NextRequest
  ): Promise<AuditLogEntry> {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      userId,
      action,
      resource,
      details,
      ipAddress: request?.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown',
    };

    this.logs.push(entry);

    // In production, send to database or external logging service
    console.log(`[AUDIT] ${action} by ${userId} on ${resource}`);

    return entry;
  }

  async getLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLogEntry[]> {
    let filtered = [...this.logs];

    if (filters?.userId) {
      filtered = filtered.filter(l => l.userId === filters.userId);
    }
    if (filters?.action) {
      filtered = filtered.filter(l => l.action === filters.action);
    }
    if (filters?.resource) {
      filtered = filtered.filter(l => l.resource === filters.resource);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(l => l.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(l => l.timestamp <= filters.endDate!);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
    if (format === 'csv') {
      const headers = ['timestamp', 'userId', 'action', 'resource', 'details'];
      const rows = this.logs.map(l =>
        [l.timestamp.toISOString(), l.userId, l.action, l.resource, JSON.stringify(l.details)].join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }
    return JSON.stringify(this.logs, null, 2);
  }
}

export const auditLogger = new AuditLogger();
