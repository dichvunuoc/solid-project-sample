/**
 * Permission Hooks
 *
 * React hooks for checking permissions in components.
 * These hooks integrate with your session/auth system to get the user's role.
 */

import { useSession } from '@/entities/session/api/use-session'
import { deriveAppRoleFromSession } from '../auth-role'
import {
  hasPermission,
  hasAnyPermission,
  canAccessRoute,
  hasRoleLevel,
  type Role,
  type Permission,
} from '../permissions'

function useTokenPermissionSet(): Set<string> {
  const { data: session } = useSession()
  const list = session?.user?.permissions
  if (!list?.length) return new Set()
  return new Set(list)
}

/**
 * Get the user's role from session (Keycloak `roles[]`, optional `role`, or mock default).
 */
function useUserRole(): Role {
  const { data: session } = useSession()
  return deriveAppRoleFromSession(session ?? null)
}

/**
 * Hook to check if user has a specific permission
 *
 * @param permission - Permission to check
 * @returns Whether user has the permission
 *
 * @example
 * ```tsx
 * function DeleteButton() {
 *   const canDelete = usePermission('delete:post')
 *
 *   if (!canDelete) return null
 *
 *   return <button>Delete</button>
 * }
 * ```
 */
export function usePermission(permission: Permission): boolean {
  const tokenSet = useTokenPermissionSet()
  const role = useUserRole()
  return tokenSet.has(permission) || hasPermission(role, permission)
}

/**
 * Hook to check if user has any of the specified permissions
 *
 * @param permissions - Array of permissions to check
 * @returns Whether user has at least one permission
 *
 * @example
 * ```tsx
 * function ModerateButton() {
 *   const canModerate = useAnyPermission(['moderate:comment', 'delete:comment'])
 *
 *   if (!canModerate) return null
 *
 *   return <button>Moderate</button>
 * }
 * ```
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const tokenSet = useTokenPermissionSet()
  const role = useUserRole()
  return permissions.some(p => tokenSet.has(p)) || hasAnyPermission(role, permissions)
}

/**
 * Hook to check if user has all of the specified permissions
 *
 * @param permissions - Array of permissions to check
 * @returns Whether user has all permissions
 */
export function useAllPermissions(permissions: Permission[]): boolean {
  const tokenSet = useTokenPermissionSet()
  const role = useUserRole()
  return permissions.every(p => tokenSet.has(p) || hasPermission(role, p))
}

/**
 * Hook to check if user can access a specific route
 *
 * @param path - Route path
 * @returns Whether user can access the route
 *
 * @example
 * ```tsx
 * function AdminLink() {
 *   const canAccess = useCanAccessRoute('/admin')
 *
 *   if (!canAccess) return null
 *
 *   return <Link to="/admin">Admin Panel</Link>
 * }
 * ```
 */
export function useCanAccessRoute(path: string): boolean {
  const role = useUserRole()
  return canAccessRoute(path, role)
}

/**
 * Hook to check if user has a specific role level or higher
 *
 * @param requiredRole - Required role level
 * @returns Whether user has the required role level
 *
 * @example
 * ```tsx
 * function ModeratorFeature() {
 *   const isModerator = useHasRoleLevel('moderator')
 *
 *   if (!isModerator) return null
 *
 *   return <div>Moderator Tools</div>
 * }
 * ```
 */
export function useHasRoleLevel(requiredRole: Role): boolean {
  const role = useUserRole()
  return hasRoleLevel(role, requiredRole)
}

/**
 * Hook that returns the current user's role
 *
 * @returns User's role
 *
 * @example
 * ```tsx
 * function UserInfo() {
 *   const role = useRole()
 *
 *   return <div>Your role: {role}</div>
 * }
 * ```
 */
export function useRole(): Role {
  return useUserRole()
}

/**
 * Hook that returns multiple permission checks at once
 *
 * @param permissions - Object of permission names to check
 * @returns Object with boolean values for each permission
 *
 * @example
 * ```tsx
 * function PostActions() {
 *   const { canEdit, canDelete } = usePermissions({
 *     canEdit: 'edit:post',
 *     canDelete: 'delete:post',
 *   })
 *
 *   return (
 *     <div>
 *       {canEdit && <button>Edit</button>}
 *       {canDelete && <button>Delete</button>}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePermissions<T extends Record<string, Permission>>(
  permissions: T
): Record<keyof T, boolean> {
  const tokenSet = useTokenPermissionSet()
  const role = useUserRole()

  return Object.entries(permissions).reduce(
    (acc, [key, permission]) => {
      acc[key as keyof T] = tokenSet.has(permission) || hasPermission(role, permission)
      return acc
    },
    {} as Record<keyof T, boolean>
  )
}
