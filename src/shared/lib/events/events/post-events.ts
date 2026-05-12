/**
 * Post Domain Events
 * 
 * All events related to post operations.
 */

import { BaseEvent } from '../core/event.base';
import { POST_LIKED, POST_CREATED, POST_DELETED, type EventKey } from '../event-key'

export class PostLikedEvent extends BaseEvent {
  readonly eventName: EventKey = POST_LIKED
  readonly postId: string
  readonly userId: string

  constructor(params: { postId: string; userId: string; timestamp?: number }) {
    super(params.timestamp)
    this.postId = params.postId
    this.userId = params.userId
  }

  protected getPayload(): Record<string, unknown> {
    return {
      postId: this.postId,
      userId: this.userId,
    }
  }
}

export class PostCreatedEvent extends BaseEvent {
  readonly eventName: EventKey = POST_CREATED
  readonly postId: string
  readonly authorId: string
  readonly title: string

  constructor(params: {
    postId: string
    authorId: string
    title: string
    timestamp?: number
  }) {
    super(params.timestamp)
    this.postId = params.postId
    this.authorId = params.authorId
    this.title = params.title
  }

  protected getPayload(): Record<string, unknown> {
    return {
      postId: this.postId,
      authorId: this.authorId,
      title: this.title,
    }
  }
}

export class PostDeletedEvent extends BaseEvent {
  readonly eventName: EventKey = POST_DELETED
  readonly postId: string
  readonly userId: string

  constructor(params: { postId: string; userId: string; timestamp?: number }) {
    super(params.timestamp)
    this.postId = params.postId
    this.userId = params.userId
  }

  protected getPayload(): Record<string, unknown> {
    return {
      postId: this.postId,
      userId: this.userId,
    }
  }
}


