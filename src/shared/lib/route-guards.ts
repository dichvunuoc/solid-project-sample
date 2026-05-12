/**
 * Route Guards
 *
 * Utilities for protecting routes with authentication checks.
 */

import { redirect } from '@tanstack/react-router'
import { authClient } from './client-auth'

/**
 * Check if user is authenticated
 * @returns true if authenticated, false otherwise
 */
export async function requireAuth(): Promise<boolean> {
  try {
    const session = await authClient.getSession()
    return session !== null
  } catch {
    return false
  }
}

/**
 * Route guard for protected routes
 * Redirects to login if not authenticated
 */
export async function authGuard(): Promise<void> {
  const isAuthenticated = await requireAuth()
  if (!isAuthenticated) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/dashboard'
    throw redirect({
      to: '/login',
      search: {
        redirect: currentPath,
      },
    })
  }
}
