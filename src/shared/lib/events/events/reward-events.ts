/**
 * Reward Domain Events
 * 
 * All events related to reward processing.
 */

import { BaseEvent } from '..'
import { REWARD_PROCESSED, REWARD_FAILED, type EventKey } from '../event-key'

export class RewardProcessedEvent extends BaseEvent {
  readonly eventName: EventKey = REWARD_PROCESSED
  readonly userId: string
  readonly rewardId: string
  readonly amount: number
  readonly reason: string

  constructor(params: {
    userId: string
    rewardId: string
    amount: number
    reason: string
    timestamp?: number
  }) {
    super(params.timestamp)
    this.userId = params.userId
    this.rewardId = params.rewardId
    this.amount = params.amount
    this.reason = params.reason
  }

  protected getPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      rewardId: this.rewardId,
      amount: this.amount,
      reason: this.reason,
    }
  }
}

export class RewardFailedEvent extends BaseEvent {
  readonly eventName: EventKey = REWARD_FAILED
  readonly userId: string
  readonly reason: string
  readonly error: string

  constructor(params: {
    userId: string
    reason: string
    error: string
    timestamp?: number
  }) {
    super(params.timestamp)
    this.userId = params.userId
    this.reason = params.reason
    this.error = params.error
  }

  protected getPayload(): Record<string, unknown> {
    return {
      userId: this.userId,
      reason: this.reason,
      error: this.error,
    }
  }
}


