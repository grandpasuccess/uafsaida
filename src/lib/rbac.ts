// UAFSAIDA — Role-Based Access Control (RBAC)
export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum Permission {
  // Project permissions
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_SHARE = 'project:share',

  // File permissions
  FILE_CREATE = 'file:create',
  FILE_READ = 'file:read',
  FILE_UPDATE = 'file:update',
  FILE_DELETE = 'file:delete',

  // Agent permissions
  AGENT_EXECUTE = 'agent:execute',
  AGENT_READ = 'agent:read',

  // User management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',

  // System
  SYSTEM_CONFIGURE = 'system:configure',
  SYSTEM_AUDIT = 'system:audit',
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_SHARE,
    Permission.FILE_CREATE,
    Permission.FILE_READ,
    Permission.FILE_UPDATE,
    Permission.FILE_DELETE,
    Permission.AGENT_EXECUTE,
    Permission.AGENT_READ,
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.SYSTEM_CONFIGURE,
    Permission.SYSTEM_AUDIT,
  ],
  [Role.EDITOR]: [
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_SHARE,
    Permission.FILE_CREATE,
    Permission.FILE_READ,
    Permission.FILE_UPDATE,
    Permission.FILE_DELETE,
    Permission.AGENT_EXECUTE,
    Permission.AGENT_READ,
    Permission.USER_READ,
  ],
  [Role.VIEWER]: [
    Permission.PROJECT_READ,
    Permission.FILE_READ,
    Permission.AGENT_READ,
    Permission.USER_READ,
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function canAccessProject(userId: string, projectId: string, action: Permission): boolean {
  // In production, check project membership and user role
  return true;
}
