/**
 * Events Public API
 * 
 * Centralized exports for all event-related types and utilities.
 */

export type { ApplicationEvents } from './registry'
export { BaseEvent } from './core/event.base'
export {
  PostLikedEvent,
  PostCreatedEvent,
  PostDeletedEvent,
} from './events/post-events'
export {
  UserUpdatedEvent,
  UserLoggedInEvent,
  UserLoggedOutEvent,
} from './events/user-events'
export {
  RewardProcessedEvent,
  RewardFailedEvent,
} from './events/reward-events'
export { NotificationCreatedEvent } from './events/notification-events'
export {
  PaymentSuccessEvent,
  PaymentFailedEvent,
} from './events/payment-events'
export {
  POST_LIKED,
  POST_CREATED,
  POST_DELETED,
  USER_UPDATED,
  USER_LOGGED_IN,
  USER_LOGGED_OUT,
  REWARD_PROCESSED,
  REWARD_FAILED,
  NOTIFICATION_CREATED,
  PAYMENT_SUCCESS,
  PAYMENT_FAILED,
  type EventKey as EventName,
} from './event-key'
export { eventBus } from './bus'


