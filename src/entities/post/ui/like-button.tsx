/**
 * Post — Like button (Solid).
 *
 * Demonstrates a feature that calls an action and forwards an event onto the
 * shared bus. The local `isLiked` / `isLoading` flags are Solid signals so
 * only the button label re-renders on state change.
 */

import { createSignal, Show } from 'solid-js'
import { likePost } from '../api/like-post'

interface LikeButtonProps {
  postId: string
  userId: string
  initialLiked?: boolean
}

export function LikeButton(props: LikeButtonProps) {
  const [isLiked, setIsLiked] = createSignal(props.initialLiked ?? false)
  const [isLoading, setIsLoading] = createSignal(false)

  const handleLike = async () => {
    setIsLoading(true)
    try {
      await likePost({ postId: props.postId, userId: props.userId })
      setIsLiked(true)
    } catch (error) {
      console.error('Failed to like post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLoading() || isLiked()}
      class={`px-4 py-2 rounded ${
        isLiked()
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white disabled:opacity-50`}
    >
      <Show when={isLoading()} fallback={isLiked() ? 'Liked' : 'Like'}>
        Liking...
      </Show>
    </button>
  )
}
