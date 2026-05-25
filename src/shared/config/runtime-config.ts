/**
 * Runtime configuration loaded from /config.json at deploy time.
 *
 * Use this when the same Docker image must point at different API gateways
 * or IAM hosts per environment without rebuilding.
 */

import { env } from './env'

export interface RuntimeConfig {
  apiUrl?: string
  secondaryApiUrl?: string
  keycloakUrl?: string
  keycloakRealm?: string
  keycloakClientId?: string
  menuAppUrl?: string
  appName?: string
}

let cached: RuntimeConfig | null = null

export async function loadRuntimeConfig(): Promise<RuntimeConfig | null> {
  if (cached) return cached
  if (env.VITE_USE_RUNTIME_CONFIG !== 'true') return null

  try {
    const res = await fetch('/config.json', { cache: 'no-store' })
    if (!res.ok) return null
    cached = (await res.json()) as RuntimeConfig
    return cached
  } catch {
    return null
  }
}

export function getRuntimeConfig(): RuntimeConfig | null {
  return cached
}

/** Apply runtime overrides to build-time env (call once before rendering app). */
export function applyRuntimeConfig(config: RuntimeConfig): void {
  if (config.apiUrl) {
    ;(env as { VITE_API_URL: string }).VITE_API_URL = config.apiUrl
  }
  if (config.secondaryApiUrl) {
    ;(env as { VITE_SECONDARY_API_URL: string }).VITE_SECONDARY_API_URL = config.secondaryApiUrl
  }
  if (config.keycloakUrl) {
    ;(env as { VITE_KEYCLOAK_URL: string }).VITE_KEYCLOAK_URL = config.keycloakUrl
  }
  if (config.keycloakRealm) {
    ;(env as { VITE_KEYCLOAK_REALM: string }).VITE_KEYCLOAK_REALM = config.keycloakRealm
  }
  if (config.keycloakClientId) {
    ;(env as { VITE_KEYCLOAK_CLIENT_ID: string }).VITE_KEYCLOAK_CLIENT_ID = config.keycloakClientId
  }
  if (config.menuAppUrl) {
    ;(env as { VITE_MENU_APP_URL: string }).VITE_MENU_APP_URL = config.menuAppUrl
  }
  if (config.appName) {
    ;(env as { VITE_APP_NAME: string }).VITE_APP_NAME = config.appName
  }
}
