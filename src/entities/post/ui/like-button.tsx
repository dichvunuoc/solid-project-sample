/**
 * Post Entity - Like Button Component
 * 
 * Example UI component that uses the likePost action.
 * This demonstrates how entities can emit events.
 */

import { useState } from 'react'
import { likePost } from '../api/like-post'

interface LikeButtonProps {
  postId: string
  userId: string
  initialLiked?: boolean
}

export function LikeButton({ postId, userId, initialLiked = false }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    setIsLoading(true)
    try {
      await likePost({ postId, userId })
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
      disabled={isLoading || isLiked}
      className={`px-4 py-2 rounded ${
        isLiked
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white disabled:opacity-50`}
    >
      {isLoading ? 'Liking...' : isLiked ? 'Liked' : 'Like'}
    </button>
  )
}


