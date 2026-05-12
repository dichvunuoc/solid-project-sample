/**
 * Session Provider
 *
 * React Context-based session management.
 * Provides a single source of truth for auth state across the app.
 * Broadcasts session changes (login/logout/refresh) to all consumers.
 * Supports cross-tab synchronization via storage events.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-keys'
import { env } from '@/shared/config/env'
import type { AuthSessionData } from '@/shared/lib/client-auth'
import { authClient } from '@/shared/lib/client-auth'
import { attachKeycloakSessionSync } from '@/shared/lib/keycloak-auth'
import { clearUser, setUser } from '@/shared/lib/monitoring'

interface SessionContextValue {
  session: AuthSessionData | null
  isLoading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<void>
  loginSso: (redirectUri?: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const queryClient = useQueryClient()
  const initRef = useRef(false)

  const refreshSession = useCallback(async () => {
    try {
      const data = await authClient.getSession()
      setSession(data)
      setError(null)
      if (data?.user) {
        void setUser({ id: data.user.id, email: data.user.email, username: data.user.username })
      } else {
        void clearUser()
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh session'))
    }
  }, [])

  // Fetch session on mount
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    let cancelled = false

    async function loadSession() {
      try {
        const data = await authClient.getSession()
        if (cancelled) return
        setSession(data)
        if (data?.user) {
          void setUser({ id: data.user.id, email: data.user.email, username: data.user.username })
        } else {
          void clearUser()
        }
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error('Failed to load session'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadSession()

    return () => {
      cancelled = true
    }
  }, [])

  // Cross-tab synchronization
  useEffect(() => {
    function handleStorageEvent(e: StorageEvent) {
      // Re-fetch session when another tab logs in/out
      if (e.key === 'mock_session' || e.key === null) {
        void refreshSession()
      }
    }

    window.addEventListener('storage', handleStorageEvent)
    return () => window.removeEventListener('storage', handleStorageEvent)
  }, [refreshSession])

  useEffect(() => {
    if (env.VITE_AUTH_MODE !== 'keycloak') {
      return
    }

    const invalidate = () => {
      void refreshSession()
      void queryClient.invalidateQueries({ queryKey: queryKeys.session() })
    }

    attachKeycloakSessionSync(invalidate)
  }, [queryClient, refreshSession])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await authClient.signIn.email({ email, password })
      const data = await authClient.getSession()
      setSession(data)
      if (data?.user) {
        void setUser({ id: data.user.id, email: data.user.email, username: data.user.username })
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginSso = useCallback(async (redirectUri?: string) => {
    await authClient.login(redirectUri)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authClient.signOut()
    } catch {
      // signOut may fail if session already expired; continue cleanup
    }
    setSession(null)
    setError(null)
    queryClient.clear()
    void clearUser()
  }, [queryClient])

  return (
    <SessionContext.Provider
      value={{ session, isLoading, error, login, loginSso, logout, refreshSession }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSessionContext must be used within a SessionProvider')
  }
  return ctx
}
