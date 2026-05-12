/**
 * User Domain Events
 * 
 * All events related to user operations.
 */

import { BaseEvent } from '../core/event.base'
import {
  USER_UPDATED,
  USER_LOGGED_IN,
  USER_LOGGED_OUT,
  type EventKey,
} from '../event-key'

export class UserUpdatedEvent extends BaseEvent {
  readonly eventName: EventKey = USER_UPDATED
  readonly userId: string
  readonly updates: {
    name?: string
    email?: string
    avatar?: string
  }

  constructor(params: {
    userId: string
    updates: {
      name?: string
      email?: string
      avatar?: string
    }
    timestamp?: number
  }) {
    super(params.timestamp)
    this.userId = params.userId
    this.updates = params.updates
  }

  protected getPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      updates: this.updates,
    }
  }
}

export class UserLoggedInEvent extends BaseEvent {
  readonly eventName: EventKey = USER_LOGGED_IN
  readonly userId: string
  readonly email: string

  constructor(params: { userId: string; email: string; timestamp?: number }) {
    super(params.timestamp)
    this.userId = params.userId
    this.email = params.email
  }

  protected getPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      email: this.email,
    }
  }
}

export class UserLoggedOutEvent extends BaseEvent {
  readonly eventName: EventKey = USER_LOGGED_OUT
  readonly userId: string

  constructor(params: { userId: string; timestamp?: number }) {
    super(params.timestamp)
    this.userId = params.userId
  }

  protected getPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
    }
  }
}


