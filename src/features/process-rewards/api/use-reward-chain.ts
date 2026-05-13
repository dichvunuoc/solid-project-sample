/**
 * Reward chain — Solid edition.
 *
 * Subscribes to `post:liked` bus events, calls the reward microservice via
 * `@tanstack/solid-query`'s `useMutation`, then forwards a
 * `reward:processed` / `reward:failed` event back onto the bus.
 */

import { useMutation } from '@tanstack/solid-query'
import { onCleanup, onMount } from 'solid-js'
import { httpClient } from '@/shared/api/http-client'
import { eventBus } from '@/shared/lib/events/bus'
import {
  POST_LIKED,
  PostLikedEvent,
  RewardFailedEvent,
  RewardProcessedEvent,
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

async function processRewardMicroservice(
  params: ProcessRewardParams
): Promise<ProcessRewardResponse> {
  return httpClient.post<ProcessRewardResponse>('/api/rewards/process', params, {
    skipErrorToast: true,
  })
}

export function useRewardChain() {
  const mutation = useMutation(() => ({
    mutationFn: processRewardMicroservice,
    onSuccess: (data: ProcessRewardResponse, variables: ProcessRewardParams) => {
      const event = new RewardProcessedEvent({
        userId: variables.userId,
        rewardId: data.rewardId,
        amount: data.amount,
        reason: `Post ${variables.postId} was liked`,
      })
      eventBus.emit(event.eventName, event)
    },
    onError: (error: Error, variables: ProcessRewardParams) => {
      const event = new RewardFailedEvent({
        userId: variables.userId,
        reason: `Failed to process reward for post ${variables.postId}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      eventBus.emit(event.eventName, event)
    },
  }))

  const processReward = (params: ProcessRewardParams) => mutation.mutate(params)

  onMount(() => {
    const handlePostLiked = (payload: PostLikedEvent) => {
      processReward({
        userId: payload.userId,
        postId: payload.postId,
        action: 'like',
      })
    }
    eventBus.on(POST_LIKED, handlePostLiked)
    onCleanup(() => eventBus.off(POST_LIKED, handlePostLiked))
  })

  return {
    processReward,
    get isProcessing() {
      return mutation.isPending
    },
    get error() {
      return mutation.error
    },
  }
}
