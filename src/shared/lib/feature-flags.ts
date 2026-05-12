/**
 * Feature Flags System
 *
 * Centralized feature flag management for gradual rollouts, A/B testing,
 * and toggling features without code changes.
 *
 * Features can be controlled via:
 * 1. Environment variables (.env)
 * 2. Remote config (e.g., LaunchDarkly, Firebase Remote Config)
 * 3. Local storage (for development testing)
 *
 * Usage:
 * ```tsx
 * import { useFeatureFlag } from '@/shared/lib/feature-flags'
 *
 * function NewFeature() {
 *   const isEnabled = useFeatureFlag('newDashboard')
 *
 *   if (!isEnabled) return null
 *
 *   return <NewDashboardComponent />
 * }
 * ```
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Feature Flag Keys
 *
 * Define all feature flags in your application here.
 */
export const FEATURE_FLAGS = {
  // UI Features
  NEW_DASHBOARD: 'newDashboard',
  DARK_MODE: 'darkMode',
  NEW_EDITOR: 'newEditor',

  // Beta Features
  BETA_FEATURES: 'betaFeatures',
  EXPERIMENTAL_API: 'experimentalApi',

  // Business Features
  PAYMENTS_V2: 'paymentsV2',
  ADVANCED_ANALYTICS: 'advancedAnalytics',
  REAL_TIME_NOTIFICATIONS: 'realTimeNotifications',

  // Development Features
  DEBUG_MODE: 'debugMode',
  MOCK_DATA: 'mockData',
  PERFORMANCE_MONITORING: 'performanceMonitoring',
} as const

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS]

/**
 * Feature Flag Configuration
 */
interface FeatureFlagConfig {
  enabled: boolean
  description?: string
  // Optional: User targeting (e.g., enable for specific users/roles)
  targetUsers?: string[]
  targetRoles?: string[]
  // Optional: Percentage rollout (0-100)
  rolloutPercentage?: number
}

type FeatureFlags = Record<FeatureFlagKey, boolean | FeatureFlagConfig>

/**
 * Default feature flags
 *
 * Set default values for all feature flags.
 * These can be overridden by environment variables or remote config.
 */
const defaultFlags: FeatureFlags = {
  [FEATURE_FLAGS.NEW_DASHBOARD]: false,
  [FEATURE_FLAGS.DARK_MODE]: true,
  [FEATURE_FLAGS.NEW_EDITOR]: false,
  [FEATURE_FLAGS.BETA_FEATURES]: false,
  [FEATURE_FLAGS.EXPERIMENTAL_API]: false,
  [FEATURE_FLAGS.PAYMENTS_V2]: false,
  [FEATURE_FLAGS.ADVANCED_ANALYTICS]: false,
  [FEATURE_FLAGS.REAL_TIME_NOTIFICATIONS]: false,
  [FEATURE_FLAGS.DEBUG_MODE]: import.meta.env.DEV,
  [FEATURE_FLAGS.MOCK_DATA]: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  [FEATURE_FLAGS.PERFORMANCE_MONITORING]:
    import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
}

/**
 * Load feature flags from environment variables
 */
function loadFlagsFromEnv(): Partial<FeatureFlags> {
  const envFlags: Partial<FeatureFlags> = {}

  // Beta features from env
  if (import.meta.env.VITE_ENABLE_BETA_FEATURES === 'true') {
    envFlags[FEATURE_FLAGS.BETA_FEATURES] = true
  }

  // Debug mode from env
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    envFlags[FEATURE_FLAGS.DEBUG_MODE] = true
  }

  return envFlags
}

/**
 * Feature Flag Store
 */
interface FeatureFlagStore {
  flags: FeatureFlags
  setFlag: (key: FeatureFlagKey, value: boolean | FeatureFlagConfig) => void
  setFlags: (flags: Partial<FeatureFlags>) => void
  resetFlags: () => void
  isEnabled: (key: FeatureFlagKey, userId?: string, userRole?: string) => boolean
}

const useFeatureFlagStore = create<FeatureFlagStore>()(
  persist(
    (set, get) => ({
      flags: { ...defaultFlags, ...loadFlagsFromEnv() },

      setFlag: (key, value) => {
        set(state => ({
          flags: { ...state.flags, [key]: value },
        }))
      },

      setFlags: flags => {
        set(state => ({
          flags: { ...state.flags, ...flags },
        }))
      },

      resetFlags: () => {
        set({ flags: { ...defaultFlags, ...loadFlagsFromEnv() } })
      },

      isEnabled: (key, userId, userRole) => {
        const flag = get().flags[key]

        if (typeof flag === 'boolean') {
          return flag
        }

        if (typeof flag === 'object' && flag !== null) {
          // Check if flag is enabled
          if (!flag.enabled) return false

          // Check user targeting
          if (userId && flag.targetUsers && !flag.targetUsers.includes(userId)) {
            return false
          }

          // Check role targeting
          if (userRole && flag.targetRoles && !flag.targetRoles.includes(userRole)) {
            return false
          }

          // Check percentage rollout
          if (flag.rolloutPercentage !== undefined) {
            // Simple hash-based percentage rollout
            const userHash = userId ? hashString(userId) % 100 : Math.random() * 100

            return userHash < flag.rolloutPercentage
          }

          return true
        }

        return false
      },
    }),
    {
      name: 'feature-flags-storage',
      // Only persist in development
      skipHydration: import.meta.env.PROD,
    }
  )
)

/**
 * Simple string hash function for consistent percentage rollouts
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Hook to check if a feature flag is enabled
 *
 * @param key - Feature flag key
 * @param userId - Optional user ID for targeting
 * @param userRole - Optional user role for targeting
 * @returns Whether the feature is enabled
 *
 * @example
 * ```tsx
 * function NewFeature() {
 *   const isEnabled = useFeatureFlag('newDashboard')
 *
 *   if (!isEnabled) return null
 *
 *   return <NewDashboardComponent />
 * }
 * ```
 */
export function useFeatureFlag(key: FeatureFlagKey, userId?: string, userRole?: string): boolean {
  return useFeatureFlagStore(state => state.isEnabled(key, userId, userRole))
}

/**
 * Hook to get multiple feature flags at once
 *
 * @param keys - Array of feature flag keys
 * @returns Object with boolean values for each flag
 *
 * @example
 * ```tsx
 * function Features() {
 *   const { newDashboard, betaFeatures } = useFeatureFlags([
 *     'newDashboard',
 *     'betaFeatures',
 *   ])
 *
 *   return (
 *     <div>
 *       {newDashboard && <NewDashboard />}
 *       {betaFeatures && <BetaFeatures />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFeatureFlags(
  keys: FeatureFlagKey[],
  userId?: string,
  userRole?: string
): Record<string, boolean> {
  const isEnabled = useFeatureFlagStore(state => state.isEnabled)

  return keys.reduce(
    (acc, key) => {
      acc[key] = isEnabled(key, userId, userRole)
      return acc
    },
    {} as Record<string, boolean>
  )
}

/**
 * Hook to get all feature flags
 */
export function useAllFeatureFlags(): FeatureFlags {
  return useFeatureFlagStore(state => state.flags)
}

/**
 * Hook to update feature flags (for admin/developer tools)
 */
export function useUpdateFeatureFlags() {
  const setFlag = useFeatureFlagStore(state => state.setFlag)
  const setFlags = useFeatureFlagStore(state => state.setFlags)
  const resetFlags = useFeatureFlagStore(state => state.resetFlags)

  return { setFlag, setFlags, resetFlags }
}

/**
 * Get feature flag value outside of React components
 */
export function getFeatureFlag(key: FeatureFlagKey, userId?: string, userRole?: string): boolean {
  return useFeatureFlagStore.getState().isEnabled(key, userId, userRole)
}

/**
 * Load feature flags from remote config
 *
 * Call this on app initialization to fetch flags from a remote service.
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   loadRemoteFeatureFlags('https://api.example.com/feature-flags')
 * }, [])
 * ```
 */
export async function loadRemoteFeatureFlags(url: string): Promise<void> {
  try {
    const response = await fetch(url)
    const remoteFlags = await response.json()

    useFeatureFlagStore.getState().setFlags(remoteFlags)
  } catch (error) {
    console.error('Failed to load remote feature flags:', error)
  }
}

/**
 * Feature Flag Component
 *
 * Render children only if feature flag is enabled.
 *
 * @example
 * ```tsx
 * <FeatureFlag flag="newDashboard">
 *   <NewDashboard />
 * </FeatureFlag>
 * ```
 */
interface FeatureFlagProps {
  flag: FeatureFlagKey
  children: React.ReactNode
  fallback?: React.ReactNode
  userId?: string
  userRole?: string
}

export function FeatureFlag({
  flag,
  children,
  fallback = null,
  userId,
  userRole,
}: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(flag, userId, userRole)

  if (!isEnabled) {
    return fallback
  }

  return children
}
