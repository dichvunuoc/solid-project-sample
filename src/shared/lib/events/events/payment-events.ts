/**
 * Payment Domain Events
 * 
 * All events related to payment processing.
 */

import { BaseEvent } from '../core/event.base'
import {
  PAYMENT_SUCCESS,
  PAYMENT_FAILED,
  type EventKey,
} from '../event-key'

export class PaymentSuccessEvent extends BaseEvent {
  readonly eventName: EventKey = PAYMENT_SUCCESS
  readonly orderId: string
  readonly amount: number
  readonly userId: string
  readonly paymentMethod: string

  constructor(params: {
    orderId: string
    amount: number
    userId: string
    paymentMethod: string
    timestamp?: number
  }) {
    super(params.timestamp)
    this.orderId = params.orderId
    this.amount = params.amount
    this.userId = params.userId
    this.paymentMethod = params.paymentMethod
  }

  protected getPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId,
      amount: this.amount,
      userId: this.userId,
      paymentMethod: this.paymentMethod,
    }
  }
}

export class PaymentFailedEvent extends BaseEvent {
  readonly eventName: EventKey = PAYMENT_FAILED
  readonly orderId: string
  readonly userId: string
  readonly error: string
  readonly reason: string

  constructor(params: {
    orderId: string
    userId: string
    error: string
    reason: string
    timestamp?: number
  }) {
    super(params.timestamp)
    this.orderId = params.orderId
    this.userId = params.userId
    this.error = params.error
    this.reason = params.reason
  }

  protected getPayload(): Record<string, unknown> {
    return {
      orderId: this.orderId,
      userId: this.userId,
      error: this.error,
      reason: this.reason,
    }
  }
}

