/**
 * Notification Domain Events
 * 
 * All events related to notifications.
 */

import { BaseEvent } from '../core/event.base'
import { NOTIFICATION_CREATED, type EventKey } from '../event-key'

export class NotificationCreatedEvent extends BaseEvent {
  readonly eventName: EventKey = NOTIFICATION_CREATED
  readonly notificationId: string
  readonly userId: string
  readonly type: string
  readonly message: string

  constructor(params: {
    notificationId: string
    userId: string
    type: string
    message: string
    timestamp?: number
  }) {
    super(params.timestamp)
    this.notificationId = params.notificationId
    this.userId = params.userId
    this.type = params.type
    this.message = params.message
  }

  protected getPayload(): Record<string, unknown> {
    return {
      notificationId: this.notificationId,
      userId: this.userId,
      type: this.type,
      message: this.message,
    }
  }
}


