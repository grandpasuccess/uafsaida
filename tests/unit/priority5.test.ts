// UAFSAIDA — Priority 5 Enterprise Feature Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { Role, Permission, hasPermission, getRolePermissions } from '@/lib/rbac';
import { auditLogger, AuditAction } from '@/lib/audit';
import { getAvailableProviders, createProvider } from '@/lib/ai-providers';

describe('RBAC', () => {
  it('should have 3 roles', () => {
    expect(Object.keys(Role)).toHaveLength(3);
    expect(Role.ADMIN).toBe('admin');
    expect(Role.EDITOR).toBe('editor');
    expect(Role.VIEWER).toBe('viewer');
  });

  it('should grant admin all permissions', () => {
    const permissions = getRolePermissions(Role.ADMIN);
    expect(permissions).toContain(Permission.PROJECT_CREATE);
    expect(permissions).toContain(Permission.PROJECT_DELETE);
    expect(permissions).toContain(Permission.USER_DELETE);
    expect(permissions).toContain(Permission.SYSTEM_CONFIGURE);
  });

  it('should grant editor limited permissions', () => {
    const permissions = getRolePermissions(Role.EDITOR);
    expect(permissions).toContain(Permission.PROJECT_CREATE);
    expect(permissions).toContain(Permission.FILE_CREATE);
    expect(permissions).not.toContain(Permission.PROJECT_DELETE);
    expect(permissions).not.toContain(Permission.USER_DELETE);
  });

  it('should grant viewer read-only permissions', () => {
    const permissions = getRolePermissions(Role.VIEWER);
    expect(permissions).toContain(Permission.PROJECT_READ);
    expect(permissions).toContain(Permission.FILE_READ);
    expect(permissions).not.toContain(Permission.PROJECT_CREATE);
    expect(permissions).not.toContain(Permission.FILE_DELETE);
  });

  it('should check permission correctly', () => {
    expect(hasPermission(Role.ADMIN, Permission.PROJECT_DELETE)).toBe(true);
    expect(hasPermission(Role.EDITOR, Permission.PROJECT_DELETE)).toBe(false);
    expect(hasPermission(Role.VIEWER, Permission.PROJECT_READ)).toBe(true);
  });
});

describe('Audit Logger', () => {
  it('should create an instance', () => {
    expect(auditLogger).toBeDefined();
  });

  it('should log an action', async () => {
    const entry = await auditLogger.log(
      'user-1',
      AuditAction.PROJECT_CREATED,
      'project',
      { name: 'Test Project' }
    );

    expect(entry).toBeDefined();
    expect(entry.userId).toBe('user-1');
    expect(entry.action).toBe(AuditAction.PROJECT_CREATED);
  });

  it('should get logs with filters', async () => {
    await auditLogger.log('user-1', AuditAction.PROJECT_CREATED, 'project');
    await auditLogger.log('user-2', AuditAction.FILE_CREATED, 'file');

    const logs = await auditLogger.getLogs({ action: AuditAction.PROJECT_CREATED });
    expect(logs.length).toBeGreaterThan(0);
  });

  it('should export logs as JSON', async () => {
    await auditLogger.log('user-1', AuditAction.USER_LOGIN, 'auth');
    const json = await auditLogger.exportLogs('json');
    
    expect(json).toBeDefined();
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('should export logs as CSV', async () => {
    await auditLogger.log('user-1', AuditAction.USER_LOGIN, 'auth');
    const csv = await auditLogger.exportLogs('csv');
    
    expect(csv).toBeDefined();
    expect(csv).toContain('timestamp');
    expect(csv).toContain('userId');
  });
});

describe('AI Providers', () => {
  it('should get available providers', () => {
    const providers = getAvailableProviders();
    expect(Array.isArray(providers)).toBe(true);
  });

  it('should create Anthropic provider', () => {
    const provider = createProvider('anthropic');
    expect(provider.name).toBe('anthropic');
  });

  it('should create OpenAI provider', () => {
    const provider = createProvider('openai');
    expect(provider.name).toBe('openai');
  });

  it('should create custom provider', () => {
    const provider = createProvider('custom');
    expect(provider.name).toBe('custom');
  });

  it('should throw for unknown provider', () => {
    expect(() => createProvider('unknown' as any)).toThrow();
  });
});
