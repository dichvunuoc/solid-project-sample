/**
 * Post Entity - Like Post Action
 * 
 * This entity action emits events to the shared event bus.
 * 
 * FSD Rule: Entities can only import from the Shared layer.
 * This ensures entities remain independent and reusable.
 */

import { eventBus } from '@/shared/lib/events/bus'
import { PostLikedEvent } from '@/shared/lib/events/registry'

export interface LikePostParams {
  postId: string
  userId: string
}

/**
 * Like a post and emit a post:liked event
 * 
 * @param params - Post ID and User ID
 * @returns Promise that resolves when the like action is complete
 */
export async function likePost(params: LikePostParams): Promise<void> {
  const { postId, userId } = params

  // Here you would typically:
  // 1. Call your API to like the post
  // 2. Update local state/cache
  // 3. Then emit the event

  // Example API call (commented out - implement based on your API)
  // await fetch(`/api/posts/${postId}/like`, {
  //   method: 'POST',
  //   body: JSON.stringify({ userId }),
  // })

  // Emit the event to notify all subscribers
  const event = new PostLikedEvent({ postId, userId })
  eventBus.emit(event.eventName, event)
}

