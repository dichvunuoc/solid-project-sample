/**
 * Route Guards
 *
 * Utilities for protecting routes with authentication checks.
 */

import { redirect } from '@tanstack/solid-router'
import { env } from '@/shared/config/env'
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

function buildReturnUrl(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return `${window.location.origin}${window.location.pathname}${window.location.search}`
}

/**
 * Route guard for protected routes.
 * - Keycloak: starts OIDC login with return URL (SSO session may already exist).
 * - Mock / other: redirects to `/login` with `redirect` search param.
 */
export async function authGuard(): Promise<void> {
  const isAuthenticated = await requireAuth()
  if (isAuthenticated) {
    return
  }

  if (env.VITE_AUTH_MODE === 'keycloak') {
    const returnTo = buildReturnUrl() || undefined
    await authClient.login(returnTo)
    return
  }

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/dashboard'
  throw redirect({
    to: '/login',
    search: {
      redirect: currentPath,
    },
  })
}
