/**
 * Query Provider (Solid).
 *
 * Wraps the app in TanStack Solid Query. `QueryClient` is created once at
 * module scope (acceptable because the app is SPA & singleton).
 */

import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
import type { JSX } from 'solid-js'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 1 },
  },
})

export function QueryProvider(props: { children: JSX.Element }) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
      {import.meta.env.MODE === 'development' && <SolidQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
