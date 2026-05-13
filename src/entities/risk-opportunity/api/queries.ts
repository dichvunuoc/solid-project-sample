/**
 * Risk Opportunity — query options for `@tanstack/solid-query`.
 */

import { queryOptions } from '@tanstack/solid-query'
import { queryKeys } from '@/shared/api/query-keys'
import type {
  Opportunity,
  OpportunityListFilters,
} from '../model/types'
import { opportunityStore } from './seed'

async function delay<T>(value: T, ms = 200): Promise<T> {
  await new Promise(r => setTimeout(r, ms))
  return value
}

function applyFilters(
  list: Opportunity[],
  filters: OpportunityListFilters | undefined
): Opportunity[] {
  if (!filters) return list
  return list.filter(op => {
    if (filters.category && op.category !== filters.category) return false
    if (filters.level && op.level !== filters.level) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!op.title.toLowerCase().includes(q) && !op.description.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })
}

export const opportunityListQueryOptions = (filters?: OpportunityListFilters) =>
  queryOptions({
    queryKey: queryKeys.riskOpportunity.list(filters as Record<string, unknown> | undefined),
    queryFn: () => delay(applyFilters(opportunityStore.list(), filters), 120),
    staleTime: 30_000,
  })

export const opportunityByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.riskOpportunity.detail(id),
    queryFn: () => delay(opportunityStore.get(id) ?? null, 120),
  })
