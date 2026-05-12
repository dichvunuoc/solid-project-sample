/**
 * Application Events Registry
 *
 * This is the single source of truth for all event types in the application.
 * The mapping is created directly from event classes and their event names.
 *
 * FSD Rule: Lower layers cannot depend on higher layers.
 * This registry is in the Shared layer, making it accessible to all layers.
 */

import { BaseEvent } from './core/event.base'
import {
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
} from './event-key'
import { NotificationCreatedEvent } from './events/notification-events'
import { PaymentSuccessEvent, PaymentFailedEvent } from './events/payment-events'
import { PostLikedEvent, PostCreatedEvent, PostDeletedEvent } from './events/post-events'
import { RewardProcessedEvent, RewardFailedEvent } from './events/reward-events'
import { UserUpdatedEvent, UserLoggedInEvent, UserLoggedOutEvent } from './events/user-events'

/**
 * Application Events
 *
 * Maps event names to their event class types.
 * Since each event class contains its own eventName, we create the mapping
 * directly here using the event name constants and their corresponding classes.
 */
export interface ApplicationEvents {
  [POST_LIKED]: PostLikedEvent
  [POST_CREATED]: PostCreatedEvent
  [POST_DELETED]: PostDeletedEvent
  [USER_UPDATED]: UserUpdatedEvent
  [USER_LOGGED_IN]: UserLoggedInEvent
  [USER_LOGGED_OUT]: UserLoggedOutEvent
  [REWARD_PROCESSED]: RewardProcessedEvent
  [REWARD_FAILED]: RewardFailedEvent
  [NOTIFICATION_CREATED]: NotificationCreatedEvent
  [PAYMENT_SUCCESS]: PaymentSuccessEvent
  [PAYMENT_FAILED]: PaymentFailedEvent
}

/**
 * Application Events with index signature for mitt compatibility
 *
 * The index signatures are required for mitt's Emitter type constraint.
 * All event classes extend BaseEvent, so they satisfy this constraint.
 */
export type ApplicationEventsWithIndex = ApplicationEvents & Record<string | symbol, BaseEvent>

/**
 * Re-export event classes for convenience
 */
export { PostLikedEvent, PostCreatedEvent, PostDeletedEvent } from './events/post-events'

export { UserUpdatedEvent, UserLoggedInEvent, UserLoggedOutEvent } from './events/user-events'

export { RewardProcessedEvent, RewardFailedEvent } from './events/reward-events'

export { NotificationCreatedEvent } from './events/notification-events'

export { PaymentSuccessEvent, PaymentFailedEvent } from './events/payment-events'

export * from './event-key'
