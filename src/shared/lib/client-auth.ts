/**
 * Auth client facade.
 *
 * Keep this module as the only public auth entry point for routes, features,
 * API clients, and session hooks. Services can switch implementation by env
 * without changing call sites.
 */

import { env } from '@/shared/config/env'
import { keycloakAuth } from './keycloak-auth'
import { isMockAuthActive, mockAuth } from './mock-auth'

export interface AuthUser {
  id: string
  email?: string
  name?: string
  username?: string
  roles?: string[]
  permissions?: string[]
  [key: string]: unknown
}

export interface AuthSession {
  token?: string
  idToken?: string
  expiresAt?: number
  [key: string]: unknown
}

export interface AuthSessionData {
  user: AuthUser
  session: AuthSession
}

export interface EmailCredentials {
  email: string
  password: string
  name?: string
}

export interface AuthClient {
  signUp: {
    email: (params: EmailCredentials) => Promise<unknown>
  }
  signIn: {
    email: (params: Pick<EmailCredentials, 'email' | 'password'>) => Promise<unknown>
  }
  signOut: () => Promise<void>
  getSession: () => Promise<AuthSessionData | null>
  getAccessToken: () => Promise<string | null>
  login: (redirectUri?: string) => Promise<void>
  logout: (redirectUri?: string) => Promise<void>
  updateToken: (minValiditySeconds?: number) => Promise<boolean>
  hasRole: (role: string) => Promise<boolean>
  hasPermission: (permission: string) => Promise<boolean>
}

const notWiredMessage =
  'Auth is not wired to your backend. Set VITE_AUTH_MODE=mock for local dev, VITE_AUTH_MODE=keycloak for SSO, or implement the backend-session adapter.'

const mockAuthClient: AuthClient = {
  signUp: {
    email: mockAuth.signUp.email,
  },
  signIn: {
    email: mockAuth.signIn.email,
  },
  signOut: mockAuth.signOut,
  getSession: mockAuth.getSession as AuthClient['getSession'],
  getAccessToken: async () => {
    const session = await mockAuth.getSession()
    return session?.session.token ?? null
  },
  login: async () => {},
  logout: mockAuth.signOut,
  updateToken: async () => true,
  hasRole: async role => role === 'user',
  hasPermission: async () => false,
}

const backendAuthPlaceholder: AuthClient = {
  signUp: {
    email: async () => {
      throw new Error(notWiredMessage)
    },
  },
  signIn: {
    email: async () => {
      throw new Error(notWiredMessage)
    },
  },
  signOut: async () => {},
  getSession: async () => null,
  getAccessToken: async () => null,
  login: async () => {
    throw new Error(notWiredMessage)
  },
  logout: async () => {},
  updateToken: async () => false,
  hasRole: async () => false,
  hasPermission: async () => false,
}

function resolveAuthClient(): AuthClient {
  if (env.VITE_AUTH_MODE === 'keycloak') {
    return keycloakAuth
  }

  if (env.VITE_AUTH_MODE === 'mock' || isMockAuthActive) {
    return mockAuthClient
  }

  return backendAuthPlaceholder
}

export const authClient = resolveAuthClient()
