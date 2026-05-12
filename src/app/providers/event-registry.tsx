/**
 * Event Registry Component
 * 
 * This component mounts all feature-level event listeners to ensure
 * event chains are active globally throughout the application.
 * 
 * FSD Rule: App layer orchestrates features and entities.
 * This component ensures all feature listeners are registered.
 */

import { useRewardChain } from '@/features/process-rewards'

/**
 * EventRegistry Component
 * 
 * Mounts all feature-level event listeners.
 * Each feature hook that subscribes to events should be called here.
 * 
 * This component should be mounted once at the app root level.
 */
export function EventRegistry() {
  // Mount the reward processing chain
  // This hook subscribes to 'post:liked' events and processes rewards
  useRewardChain()

  // Add more feature hooks here as you create them:
  // useNotificationChain()
  // useAnalyticsChain()
  // etc.

  // This component doesn't render anything
  return null
}


