/**
 * Role-Based Access Control (RBAC) System
 *
 * Defines roles, permissions, and provides utilities for authorization checks.
 *
 * Usage:
 * ```tsx
 * import { hasPermission, canAccess } from '@/shared/lib/permissions'
 *
 * if (hasPermission('admin', 'delete:post')) {
 *   // Allow deletion
 * }
 *
 * if (canAccess('/admin/users', 'admin')) {
 *   // Allow access
 * }
 * ```
 */

/**
 * Application Roles
 *
 * Define your application's roles here.
 * Roles are hierarchical: admin > moderator > user > guest
 */
export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/**
 * Application Permissions
 *
 * Define granular permissions for your application.
 * Format: <action>:<resource>
 */
export const PERMISSIONS = {
  // Post permissions
  CREATE_POST: 'create:post',
  EDIT_POST: 'edit:post',
  DELETE_POST: 'delete:post',
  VIEW_POST: 'view:post',
  LIKE_POST: 'like:post',

  // User permissions
  VIEW_USERS: 'view:users',
  CREATE_USER: 'create:user',
  EDIT_USER: 'edit:user',
  DELETE_USER: 'delete:user',
  BAN_USER: 'ban:user',

  // Comment permissions
  CREATE_COMMENT: 'create:comment',
  EDIT_COMMENT: 'edit:comment',
  DELETE_COMMENT: 'delete:comment',
  MODERATE_COMMENT: 'moderate:comment',

  // Dashboard permissions
  VIEW_DASHBOARD: 'view:dashboard',
  VIEW_ANALYTICS: 'view:analytics',
  EXPORT_DATA: 'export:data',

  // Payment permissions
  PROCESS_PAYMENT: 'process:payment',
  VIEW_PAYMENTS: 'view:payments',
  REFUND_PAYMENT: 'refund:payment',

  // Settings permissions
  VIEW_SETTINGS: 'view:settings',
  EDIT_SETTINGS: 'edit:settings',
  MANAGE_ROLES: 'manage:roles',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * Role-Permission Mapping
 *
 * Defines which permissions each role has.
 * Roles inherit permissions from lower-level roles.
 */
const rolePermissions: Record<Role, Permission[]> = {
  // Admin has all permissions
  admin: Object.values(PERMISSIONS),

  // Moderator has content moderation permissions
  moderator: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST,
    PERMISSIONS.DELETE_POST,
    PERMISSIONS.VIEW_POST,
    PERMISSIONS.LIKE_POST,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.EDIT_COMMENT,
    PERMISSIONS.DELETE_COMMENT,
    PERMISSIONS.MODERATE_COMMENT,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.BAN_USER,
  ],

  // Regular user has basic permissions
  user: [
    PERMISSIONS.CREATE_POST,
    PERMISSIONS.EDIT_POST,
    PERMISSIONS.VIEW_POST,
    PERMISSIONS.LIKE_POST,
    PERMISSIONS.CREATE_COMMENT,
    PERMISSIONS.EDIT_COMMENT,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.PROCESS_PAYMENT,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VIEW_SETTINGS,
  ],

  // Guest has minimal permissions
  guest: [PERMISSIONS.VIEW_POST],
}

/**
 * Check if a role has a specific permission
 *
 * @param role - User's role
 * @param permission - Permission to check
 * @returns Whether the role has the permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

/**
 * Check if a role has any of the specified permissions
 *
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns Whether the role has at least one permission
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if a role has all of the specified permissions
 *
 * @param role - User's role
 * @param permissions - Array of permissions to check
 * @returns Whether the role has all permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 *
 * @param role - User's role
 * @returns Array of permissions
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? []
}

/**
 * Route access control mapping
 *
 * Define which roles can access which routes.
 */
interface RouteAccess {
  path: string
  roles: Role[]
  requireAuth?: boolean
}

const routeAccessControl: RouteAccess[] = [
  // Public routes
  { path: '/', roles: Object.values(ROLES), requireAuth: false },
  { path: '/login', roles: Object.values(ROLES), requireAuth: false },
  { path: '/register', roles: Object.values(ROLES), requireAuth: false },

  // Protected routes
  { path: '/profile', roles: [ROLES.USER, ROLES.MODERATOR, ROLES.ADMIN], requireAuth: true },

  // Admin routes
  { path: '/admin', roles: [ROLES.ADMIN], requireAuth: true },
  { path: '/admin/users', roles: [ROLES.ADMIN], requireAuth: true },
  { path: '/admin/settings', roles: [ROLES.ADMIN], requireAuth: true },

  // Moderator routes
  { path: '/moderate', roles: [ROLES.MODERATOR, ROLES.ADMIN], requireAuth: true },
]

/**
 * Check if a role can access a specific route
 *
 * @param path - Route path
 * @param role - User's role
 * @returns Whether the role can access the route
 */
export function canAccessRoute(path: string, role: Role): boolean {
  // Find exact match first
  let routeConfig = routeAccessControl.find(route => route.path === path)

  // If no exact match, try prefix match (for nested routes)
  if (!routeConfig) {
    routeConfig = routeAccessControl.find(
      route => path.startsWith(route.path) && route.path !== '/'
    )
  }

  // Default to user-only if no config found
  if (!routeConfig) {
    return role === ROLES.USER || role === ROLES.MODERATOR || role === ROLES.ADMIN
  }

  return routeConfig.roles.includes(role)
}

/**
 * Check if a route requires authentication
 *
 * @param path - Route path
 * @returns Whether the route requires authentication
 */
export function requiresAuth(path: string): boolean {
  const routeConfig = routeAccessControl.find(
    route => route.path === path || (path.startsWith(route.path) && route.path !== '/')
  )

  return routeConfig?.requireAuth ?? true
}

/**
 * Role hierarchy
 * Higher values mean more permissions
 */
export const roleHierarchy: Record<Role, number> = {
  guest: 0,
  user: 1,
  moderator: 2,
  admin: 3,
}

/**
 * Check if a role is higher or equal to another role
 *
 * @param role - Role to check
 * @param requiredRole - Required role level
 * @returns Whether the role meets the requirement
 */
export function hasRoleLevel(role: Role, requiredRole: Role): boolean {
  return roleHierarchy[role] >= roleHierarchy[requiredRole]
}

/**
 * Type guard for role
 */
export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role)
}
