/**
 * Event Registry Interface
 * 
 * This is the global EventRegistry interface that defines the contract
 * for type-safe event communication using mitt.
 * 
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

import type { ApplicationEventsWithIndex } from '@/shared/lib/events/registry'
import type { Emitter } from 'mitt'

/**
 * Global EventRegistry interface
 * 
 * Provides type-safe event bus operations:
 * - emit: Broadcast events
 * - on: Subscribe to events
 * - off: Unsubscribe from events
 */
export type EventRegistry = Emitter<ApplicationEventsWithIndex>

/**
 * Re-export the event bus as the EventRegistry implementation
 */
export { eventBus as eventRegistry } from '@/shared/lib/events/bus'

/**
 * Re-export event types and utilities for convenience
 */
export type { ApplicationEvents, ApplicationEventsWithIndex } from '@/shared/lib/events/registry'
export { BaseEvent } from '@/shared/lib/events/core/event.base'
export * from '@/shared/lib/events/event-key'
export * from '@/shared/lib/events/registry'

/**
 * Re-export payment events for convenience
 */
export {
  PaymentSuccessEvent,
  PaymentFailedEvent,
} from '@/shared/lib/events/events/payment-events'

