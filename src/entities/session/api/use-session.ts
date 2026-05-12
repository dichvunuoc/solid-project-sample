/**
 * Session Hook
 *
 * Reads session data from the SessionProvider context.
 * All components share the same session state — no duplicate async calls.
 */

import { useSessionContext } from '@/entities/session/ui/session-provider'

export function useSession() {
  const { session, isLoading, error } = useSessionContext()

  return {
    data: session,
    isLoading,
    error,
    // Keep TanStack Query-style aliases for backward compatibility
    isPending: isLoading,
    isError: !!error,
    isSuccess: !isLoading && !error,
  }
}
