/**
 * Environment Variable Validation
 *
 * Validates and exports environment variables using Zod.
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().optional().default(''),
  VITE_APP_NAME: z.string().optional().default('Frontend Sample'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Authentication / IAM
  VITE_AUTH_MODE: z.enum(['mock', 'keycloak', 'backend-session']).optional().default('mock'),
  VITE_USE_MOCK_AUTH: z.string().optional().default('true'),
  VITE_KEYCLOAK_URL: z.string().optional().default(''),
  VITE_KEYCLOAK_REALM: z.string().optional().default(''),
  VITE_KEYCLOAK_CLIENT_ID: z.string().optional().default(''),
  VITE_KEYCLOAK_ON_LOAD: z.enum(['check-sso', 'login-required']).optional().default('check-sso'),
  VITE_KEYCLOAK_SILENT_CHECK_SSO_REDIRECT_URI: z.string().optional().default(''),
  // Multi-tenant support: optional tenant slug resolved at runtime
  VITE_KEYCLOAK_TENANT_REALM: z.string().optional().default(''),

  // Cross-app SSO: Menu App URL for navigation between shell and mini-apps
  VITE_MENU_APP_URL: z.string().optional().default(''),

  // Sentry configuration
  VITE_SENTRY_DSN: z.string().optional().default(''),
  VITE_SENTRY_ENVIRONMENT: z.string().optional().default('development'),
  VITE_SENTRY_ENABLED: z.string().optional().default('false'),
  VITE_SENTRY_TRACES_SAMPLE_RATE: z.string().optional().default('0.1'),

  // Feature flags
  VITE_ENABLE_BETA_FEATURES: z.string().optional().default('false'),
  VITE_DEBUG_MODE: z.string().optional().default('false'),

  // Performance monitoring
  VITE_ENABLE_PERFORMANCE_MONITORING: z.string().optional().default('false'),

  // Development settings
  VITE_USE_MOCK_DATA: z.string().optional().default('false'),

  // HTTP client
  VITE_API_TIMEOUT: z.coerce.number().optional().default(30000),

  // Optional secondary service base URL (multi-microservice pattern)
  VITE_SECONDARY_API_URL: z.string().optional().default(''),

  // Runtime config (public/config.json) — set false to skip fetch on boot
  VITE_USE_RUNTIME_CONFIG: z.string().optional().default('true'),
})

type Env = z.infer<typeof envSchema>

// Parse and validate environment variables
function getEnv(): Env {
  try {
    return envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL || '',
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME || 'Frontend Sample',
      NODE_ENV: (import.meta.env.MODE || 'development') as 'development' | 'production' | 'test',

      // Authentication / IAM
      VITE_AUTH_MODE:
        import.meta.env.VITE_AUTH_MODE ||
        (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH !== 'false'
          ? 'mock'
          : 'backend-session'),
      VITE_USE_MOCK_AUTH: import.meta.env.VITE_USE_MOCK_AUTH || 'true',
      VITE_KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL || '',
      VITE_KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM || '',
      VITE_KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || '',
      VITE_KEYCLOAK_ON_LOAD: import.meta.env.VITE_KEYCLOAK_ON_LOAD || 'check-sso',
      VITE_KEYCLOAK_SILENT_CHECK_SSO_REDIRECT_URI:
        import.meta.env.VITE_KEYCLOAK_SILENT_CHECK_SSO_REDIRECT_URI || '',
      VITE_KEYCLOAK_TENANT_REALM: import.meta.env.VITE_KEYCLOAK_TENANT_REALM || '',

      // Cross-app SSO
      VITE_MENU_APP_URL: import.meta.env.VITE_MENU_APP_URL || '',

      // Sentry
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
      VITE_SENTRY_ENVIRONMENT: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
      VITE_SENTRY_ENABLED: import.meta.env.VITE_SENTRY_ENABLED || 'false',
      VITE_SENTRY_TRACES_SAMPLE_RATE: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1',

      // Feature flags
      VITE_ENABLE_BETA_FEATURES: import.meta.env.VITE_ENABLE_BETA_FEATURES || 'false',
      VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE || 'false',

      // Performance
      VITE_ENABLE_PERFORMANCE_MONITORING:
        import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING || 'false',

      // Development
      VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA || 'false',

      VITE_API_TIMEOUT: import.meta.env.VITE_API_TIMEOUT || '30000',
      VITE_SECONDARY_API_URL: import.meta.env.VITE_SECONDARY_API_URL || '',
      VITE_USE_RUNTIME_CONFIG: import.meta.env.VITE_USE_RUNTIME_CONFIG || 'true',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(issue => issue.path.join('.')).join(', ')
      throw new Error(
        `Invalid environment variables: ${missingVars}\n` +
          'Please check your .env file and ensure all required variables are set.'
      )
    }
    throw error
  }
}

export const env = getEnv()
