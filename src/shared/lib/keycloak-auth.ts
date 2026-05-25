import { env } from '@/shared/config/env'
import { clearTokenCache } from './auth-token'
import type { AuthClient, AuthSessionData } from './client-auth'
import type Keycloak from 'keycloak-js'

interface ParsedToken {
  exp?: number
  sub?: string
  email?: string
  name?: string
  preferred_username?: string
  scope?: string
  realm_access?: {
    roles?: string[]
  }
  resource_access?: Record<
    string,
    {
      roles?: string[]
    }
  >
  permissions?: string[]
  authorization?: {
    permissions?: Array<{ rsname?: string; scopes?: string[] }>
  }
}

let keycloak: Keycloak | null = null
let initPromise: Promise<boolean> | null = null

function requireKeycloakConfig() {
  const missing = [
    ['VITE_KEYCLOAK_URL', env.VITE_KEYCLOAK_URL],
    ['VITE_KEYCLOAK_REALM', env.VITE_KEYCLOAK_REALM],
    ['VITE_KEYCLOAK_CLIENT_ID', env.VITE_KEYCLOAK_CLIENT_ID],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Missing Keycloak configuration: ${missing.join(', ')}`)
  }
}

async function getKeycloak(): Promise<Keycloak> {
  requireKeycloakConfig()

  if (!keycloak) {
    const { default: KeycloakConstructor } = await import('keycloak-js')
    // Multi-tenant: use tenant realm if provided, otherwise default realm
    const realm = env.VITE_KEYCLOAK_TENANT_REALM || env.VITE_KEYCLOAK_REALM
    keycloak = new KeycloakConstructor({
      url: env.VITE_KEYCLOAK_URL,
      realm,
      clientId: env.VITE_KEYCLOAK_CLIENT_ID,
    })
  }

  return keycloak
}

async function initKeycloak(): Promise<boolean> {
  if (!initPromise) {
    initPromise = getKeycloak().then(kc =>
      kc.init({
        onLoad: env.VITE_KEYCLOAK_ON_LOAD,
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: env.VITE_KEYCLOAK_SILENT_CHECK_SSO_REDIRECT_URI || undefined,
      })
    )
  }

  return initPromise
}

/**
 * Subscribe to Keycloak session lifecycle so cached session data stays fresh.
 * Safe to call once at app startup; no-ops when not in Keycloak mode or when config is missing.
 */
export function attachKeycloakSessionSync(onInvalidate: () => void): void {
  if (env.VITE_AUTH_MODE !== 'keycloak') {
    return
  }

  void getKeycloak()
    .then(kc => {
      kc.onTokenExpired = () => {
        clearTokenCache()
        void kc.updateToken(30).finally(() => {
          onInvalidate()
        })
      }
      kc.onAuthLogout = () => {
        clearTokenCache()
        onInvalidate()
      }
      kc.onAuthSuccess = () => {
        clearTokenCache()
        onInvalidate()
      }
    })
    .catch(() => {
      // Missing Keycloak env or failed load — dev may run without IAM
    })
}

function readParsedToken(kc: Keycloak): ParsedToken {
  return (kc.tokenParsed ?? {}) as ParsedToken
}

function getRoles(parsed: ParsedToken): string[] {
  const realmRoles = parsed.realm_access?.roles ?? []
  const clientRoles = parsed.resource_access?.[env.VITE_KEYCLOAK_CLIENT_ID]?.roles ?? []

  return Array.from(new Set([...realmRoles, ...clientRoles]))
}

function getPermissions(parsed: ParsedToken): string[] {
  const directPermissions = parsed.permissions ?? []
  const authorizationPermissions =
    parsed.authorization?.permissions?.flatMap(permission => {
      const resource = permission.rsname
      const scopes = permission.scopes ?? []

      if (!resource) return scopes
      if (scopes.length === 0) return [resource]

      return scopes.map(scope => `${resource}:${scope}`)
    }) ?? []

  return Array.from(new Set([...directPermissions, ...authorizationPermissions]))
}

async function getSession(): Promise<AuthSessionData | null> {
  const authenticated = await initKeycloak()
  const kc = await getKeycloak()

  if (!authenticated || !kc.authenticated) {
    return null
  }

  await kc.updateToken(30)

  const parsed = readParsedToken(kc)
  const roles = getRoles(parsed)
  const permissions = getPermissions(parsed)

  return {
    user: {
      id: parsed.sub ?? '',
      email: parsed.email,
      name: parsed.name,
      username: parsed.preferred_username,
      roles,
      permissions,
    },
    session: {
      token: kc.token,
      idToken: kc.idToken,
      expiresAt: parsed.exp ? parsed.exp * 1000 : undefined,
    },
  }
}

export const keycloakAuth: AuthClient = {
  signUp: {
    email: async () => {
      const kc = await getKeycloak()
      await kc.register({ redirectUri: window.location.origin })
    },
  },
  signIn: {
    email: async () => {
      const kc = await getKeycloak()
      await kc.login({ redirectUri: window.location.origin })
    },
  },
  signOut: async () => {
    clearTokenCache()
    const kc = await getKeycloak()
    await kc.logout({ redirectUri: window.location.origin })
  },
  getSession,
  getAccessToken: async () => {
    const authenticated = await initKeycloak()
    const kc = await getKeycloak()

    if (!authenticated || !kc.authenticated) {
      return null
    }

    await kc.updateToken(30)
    return kc.token ?? null
  },
  login: async redirectUri => {
    const kc = await getKeycloak()
    await kc.login({ redirectUri: redirectUri ?? window.location.href })
  },
  logout: async redirectUri => {
    clearTokenCache()
    const kc = await getKeycloak()
    await kc.logout({ redirectUri: redirectUri ?? window.location.origin })
  },
  updateToken: async (minValiditySeconds = 30) => {
    const authenticated = await initKeycloak()
    const kc = await getKeycloak()

    if (!authenticated || !kc.authenticated) {
      return false
    }

    return kc.updateToken(minValiditySeconds)
  },
  hasRole: async role => {
    const session = await getSession()
    return session?.user.roles?.includes(role) ?? false
  },
  hasPermission: async permission => {
    const session = await getSession()
    return session?.user.permissions?.includes(permission) ?? false
  },
}
