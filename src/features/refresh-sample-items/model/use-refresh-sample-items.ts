import { useQueryClient } from '@tanstack/solid-query'
import { queryKeys } from '@/shared/api/query-keys'

export function useRefreshSampleItems() {
  const queryClient = useQueryClient()

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.sampleItems.all() })

  return { refresh }
}
