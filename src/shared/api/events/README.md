# Event System Architecture

## Structure

```
events/
├── base-event.ts           # BaseEvent interface (all events extend this)
├── post-events.ts          # Post domain events
├── user-events.ts          # User domain events
├── reward-events.ts        # Reward domain events
├── notification-events.ts  # Notification domain events
├── registry.ts             # Composes all events into ApplicationEvents
├── bus.ts                  # Event bus instance
└── index.ts                # Public API exports
```

## BaseEvent

All events must extend `BaseEvent`:

```ts
export interface BaseEvent {
  timestamp: number
}
```

This ensures:

- ✅ All events have a timestamp for ordering
- ✅ Consistent event structure
- ✅ Type safety across the system

## Domain Events

Each domain has its own file with:

1. **Event interfaces** extending `BaseEvent`
2. **Events map** interface mapping event names to payloads

Example (`post-events.ts`):

```ts
export interface PostLikedEvent extends BaseEvent {
  postId: string
  userId: string
}

export interface PostEvents {
  'post:liked': PostLikedEvent
  // ... more events
}
```

## Registry

The registry composes all domain events:

```ts
export interface ApplicationEvents
  extends PostEvents, UserEvents, RewardEvents, NotificationEvents {}
```

## Adding New Events

### Option 1: Add to Existing Domain

Edit the domain file (e.g., `post-events.ts`):

```ts
export interface PostEditedEvent extends BaseEvent {
  postId: string
  editorId: string
  changes: string[]
}

export interface PostEvents {
  // ... existing events
  'post:edited': PostEditedEvent
}
```

### Option 2: Create New Domain

1. Create `src/shared/api/events/comment-events.ts`
2. Define events extending `BaseEvent`
3. Add domain to `registry.ts`:

```ts
import type { CommentEvents } from './comment-events'

export interface ApplicationEvents
  extends PostEvents, UserEvents, RewardEvents, NotificationEvents, CommentEvents {} // Add here
```

## Usage

### Importing Events

```ts
// Specific event type
import type { PostLikedEvent } from '@/shared/api/events/registry'
// or
import type { PostLikedEvent } from '@/shared/api/events'

// All events
import type { ApplicationEvents } from '@/shared/api/events'
```

### Emitting Events

```ts
import { eventBus } from '@/shared/api/events/bus'
import type { PostLikedEvent } from '@/shared/api/events'

const event: PostLikedEvent = {
  postId: '123',
  userId: '456',
  timestamp: Date.now(),
}

eventBus.emit('post:liked', event)
```

### Subscribing to Events

```ts
import { eventBus } from '@/shared/api/events/bus'
import { logger } from '@/shared/lib/logger'
import type { PostLikedEvent } from '@/shared/api/events'

eventBus.on('post:liked', (payload: PostLikedEvent) => {
  logger.info('Post liked:', payload.postId)
})
```

## Benefits

1. **Modular**: Events organized by domain
2. **Type-safe**: All events extend BaseEvent
3. **Maintainable**: Easy to find and modify events
4. **Scalable**: Simple to add new domains
5. **Consistent**: BaseEvent ensures all events have timestamp
