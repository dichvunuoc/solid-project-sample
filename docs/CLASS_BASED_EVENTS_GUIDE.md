# Class-Based Event System Guide

## Overview

The event system has been refactored to use **classes** instead of interfaces. Each event is now a class instance that retains its event name as a property, ensuring type safety and consistency.

## Architecture

### Event Name Registry

**`src/shared/api/events/event-names.ts`**

- Contains all event name constants (e.g., `POST_LIKED = 'post:liked'`)
- Provides `EventName` union type
- Single source of truth for event names

### Base Event Class

**`src/shared/api/events/base-event.ts`**

- Abstract class that all events extend
- Requires `eventName` property (from registry)
- Provides `timestamp` (auto-set if not provided)
- Includes `getEventName()` and `toJSON()` methods

### Event Classes

Each domain has event classes that:

- Extend `BaseEvent`
- Set `eventName` from the registry
- Accept constructor parameters
- Implement `getPayload()` for serialization

Example:

```ts
export class PostLikedEvent extends BaseEvent {
  readonly eventName: EventName = POST_LIKED
  readonly postId: string
  readonly userId: string

  constructor(params: { postId: string; userId: string; timestamp?: number }) {
    super(params.timestamp)
    this.postId = params.postId
    this.userId = params.userId
  }
}
```

## Usage

### Creating Events

```ts
import { PostLikedEvent } from '@/shared/api/events'

// Create event instance
const event = new PostLikedEvent({
  postId: '123',
  userId: '456',
  // timestamp is optional (defaults to Date.now())
})

// Event name is retained in the instance
console.log(event.eventName) // 'post:liked'
console.log(event.getEventName()) // 'post:liked'
```

### Emitting Events

```ts
import {} from '@/shared/api/events/bus'
import { PostLikedEvent } from '@/shared/api/events'

// Create and emit
const event = new PostLikedEvent({ postId: '123', userId: '456' }).emit(event.eventName, event) // Uses event.eventName from the class
```

### Subscribing to Events

```ts
import {  } from '@/shared/api/events/bus'
import { PostLikedEvent, POST_LIKED } from '@/shared/api/events'

// Subscribe using the event name constant
.on(POST_LIKED, (event: PostLikedEvent) => {
  console.log('Post liked:', event.postId)
  console.log('Event name:', event.eventName) // Available on instance
  console.log('Timestamp:', event.timestamp)
})
```

## Benefits

1. **Event Name Retention**: Each event instance knows its own name
2. **Type Safety**: Classes provide better type checking than interfaces
3. **Consistency**: Event names come from a single registry
4. **Serialization**: Built-in `toJSON()` method for logging/debugging
5. **Validation**: Can add validation logic in constructors
6. **Immutability**: Readonly properties ensure events are immutable

## Event Name Registry

All event names are defined in `event-names.ts`:

```ts
export const POST_LIKED = 'post:liked' as const
export const POST_CREATED = 'post:created' as const
// ... etc
```

Event classes import and use these constants:

```ts
import { POST_LIKED } from './event-names'

export class PostLikedEvent extends BaseEvent {
  readonly eventName: EventName = POST_LIKED
  // ...
}
```

## Complete Example

### Entity (Producer)

```ts
import {} from '@/shared/api/events/bus'
import { PostLikedEvent } from '@/shared/api/events'

export async function likePost(params: { postId: string; userId: string }) {
  // ... business logic ...

  // Create and emit event
  const event = new PostLikedEvent(params).emit(event.eventName, event)
}
```

### Feature (Consumer)

```ts
import { useEffect } from 'react'
import {  } from '@/shared/api/events/bus'
import { PostLikedEvent, POST_LIKED } from '@/shared/api/events'

export function usePostLikedHandler() {
  useEffect(() => {
    const handler = (event: PostLikedEvent) => {
      console.log(`Post ${event.postId} was liked by ${event.userId}`)
      console.log(`Event name: ${event.eventName}`)
      console.log(`Timestamp: ${event.timestamp}`)
    }

    .on(POST_LIKED, handler)
    return () => .off(POST_LIKED, handler)
  }, [])
}
```

## Adding New Events

### 1. Add Event Name to Registry

```ts
// src/shared/api/events/event-names.ts
export const COMMENT_CREATED = 'comment:created' as const

// Add to EventName union type
export type EventName = typeof POST_LIKED | typeof COMMENT_CREATED // Add here
// ...
```

### 2. Create Event Class

```ts
// src/shared/api/events/comment-events.ts
import { BaseEvent } from './base-event'
import { COMMENT_CREATED, type EventName } from './event-names'

export class CommentCreatedEvent extends BaseEvent {
  readonly eventName: EventName = COMMENT_CREATED
  readonly commentId: string
  readonly postId: string
  readonly authorId: string

  constructor(params: { commentId: string; postId: string; authorId: string; timestamp?: number }) {
    super(params.timestamp)
    this.commentId = params.commentId
    this.postId = params.postId
    this.authorId = params.authorId
  }

  protected getPayload(): Record<string, unknown> {
    return {
      commentId: this.commentId,
      postId: this.postId,
      authorId: this.authorId,
    }
  }
}
```

### 3. Add to Registry

```ts
// src/shared/api/events/registry.ts
import type { CommentEvents } from './comment-events'

export interface ApplicationEvents
  extends PostEvents, UserEvents, RewardEvents, NotificationEvents, CommentEvents {} // Add here

export { CommentCreatedEvent } from './comment-events'
```

## Serialization

Events can be serialized for logging or API calls:

```ts
const event = new PostLikedEvent({ postId: '123', userId: '456' })
const json = event.toJSON()
// {
//   eventName: 'post:liked',
//   timestamp: 1234567890,
//   postId: '123',
//   userId: '456'
// }
```

## Type Safety

All events are fully type-safe:

```ts
// ✅ Correct
const event = new PostLikedEvent({ postId: '123', userId: '456' })
  .emit(event.eventName, event)

  // ❌ TypeScript error - wrong event name
  .emit('wrong:name', event)

// ❌ TypeScript error - missing required fields
const invalid = new PostLikedEvent({ postId: '123' }) // Missing userId
```

## Migration from Interfaces

### Before (Interface)

```ts
const event: PostLikedEvent = {
  postId: '123',
  userId: '456',
  timestamp: Date.now(),
}.emit('post:liked', event)
```

### After (Class)

```ts
const event = new PostLikedEvent({ postId: '123', userId: '456' }).emit(event.eventName, event)
```

Benefits:

- Event name is retained in the instance
- No need to remember/hardcode event names
- Better type safety
- Can add validation/methods
