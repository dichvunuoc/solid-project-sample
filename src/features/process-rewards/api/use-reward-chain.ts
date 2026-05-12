/**
 * Process Rewards Feature - Reward Chain Hook
 *
 * This feature subscribes to events from the shared event bus and processes rewards.
 *
 * FSD Rule: Features can import from Entities and Shared layers.
 * This feature listens to post:liked events and processes rewards.
 */

import { useEffect, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { httpClient } from '@/shared/api/http-client'
import { eventBus } from '@/shared/lib/events/bus'
import {
  PostLikedEvent,
  RewardProcessedEvent,
  RewardFailedEvent,
  POST_LIKED,
} from '@/shared/lib/events/registry'

interface ProcessRewardParams {
  userId: string
  postId: string
  action: 'like'
}

interface ProcessRewardResponse {
  rewardId: string
  amount: number
  success: boolean
}

/**
 * Process reward via microservice
 */
async function processRewardMicroservice(
  params: ProcessRewardParams
): Promise<ProcessRewardResponse> {
  // Use centralized HTTP client
  return httpClient.post<ProcessRewardResponse>('/api/rewards/process', params, {
    skipErrorToast: true, // Handle errors in the mutation's onError
  })
}

/**
 * Hook that sets up the reward processing chain
 *
 * Listens to 'post:liked' events and:
 * 1. Calls the reward microservice
 * 2. Emits 'reward:processed' or 'reward:failed' events
 *
 * @returns Mutation object for manual reward processing (optional)
 */
export function useRewardChain() {
  const mutation = useMutation<ProcessRewardResponse, Error, ProcessRewardParams>({
    mutationFn: processRewardMicroservice,
    onSuccess: (data: ProcessRewardResponse, variables: ProcessRewardParams) => {
      // Emit success event
      const event = new RewardProcessedEvent({
        userId: variables.userId,
        rewardId: data.rewardId,
        amount: data.amount,
        reason: `Post ${variables.postId} was liked`,
      })
      eventBus.emit(event.eventName, event)
    },
    onError: (error: Error, variables: ProcessRewardParams) => {
      // Emit failure event
      const event = new RewardFailedEvent({
        userId: variables.userId,
        reason: `Failed to process reward for post ${variables.postId}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      eventBus.emit(event.eventName, event)
    },
  })

  // Create a stable callback for processing rewards
  const processReward = useCallback(
    (params: ProcessRewardParams) => {
      mutation.mutate(params)
    },
    [mutation]
  )

  useEffect(() => {
    // Subscribe to post:liked events
    const handlePostLiked = (payload: PostLikedEvent) => {
      // Process the reward when a post is liked
      processReward({
        userId: payload.userId,
        postId: payload.postId,
        action: 'like',
      })
    }

    eventBus.on(POST_LIKED, handlePostLiked)

    // Cleanup subscription on unmount
    return () => {
      eventBus.off(POST_LIKED, handlePostLiked)
    }
  }, [processReward])

  return {
    processReward,
    isProcessing: mutation.isPending,
    error: mutation.error,
  }
}
