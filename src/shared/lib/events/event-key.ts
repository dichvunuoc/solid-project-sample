/**
 * Event Names Registry
 * 
 * Central registry of all event name constants.
 * Event classes import these names to ensure consistency.
 */

// Post events
export const POST_LIKED = 'post:liked' as const
export const POST_CREATED = 'post:created' as const
export const POST_DELETED = 'post:deleted' as const

// User events
export const USER_UPDATED = 'user:updated' as const
export const USER_LOGGED_IN = 'user:logged-in' as const
export const USER_LOGGED_OUT = 'user:logged-out' as const

// Reward events
export const REWARD_PROCESSED = 'reward:processed' as const
export const REWARD_FAILED = 'reward:failed' as const

// Notification events
export const NOTIFICATION_CREATED = 'notification:created' as const

// Payment events
export const PAYMENT_SUCCESS = 'payment:success' as const
export const PAYMENT_FAILED = 'payment:failed' as const

/**
 * All event names as a union type
 */
export type EventKey =
  | typeof POST_LIKED
  | typeof POST_CREATED
  | typeof POST_DELETED
  | typeof USER_UPDATED
  | typeof USER_LOGGED_IN
  | typeof USER_LOGGED_OUT
  | typeof REWARD_PROCESSED
  | typeof REWARD_FAILED
  | typeof NOTIFICATION_CREATED
  | typeof PAYMENT_SUCCESS
  | typeof PAYMENT_FAILED

