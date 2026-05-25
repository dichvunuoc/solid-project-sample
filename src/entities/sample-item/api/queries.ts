import { queryOptions } from '@tanstack/solid-query'
import { httpClient } from '@/shared/api/http-client'
import { queryKeys } from '@/shared/api/query-keys'
import type { SampleItemsResponse } from '../model/types'

export async function fetchSampleItems(): Promise<SampleItemsResponse> {
  return httpClient.get<SampleItemsResponse>('/sample-items')
}

export const sampleItemsQueryOptions = queryOptions({
  queryKey: queryKeys.sampleItems.all(),
  queryFn: fetchSampleItems,
  staleTime: 1000 * 60,
})
