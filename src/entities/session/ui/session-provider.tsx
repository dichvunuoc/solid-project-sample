/**
 * Session Provider
 *
 * Provides session context for the application.
 * Note: QueryClient is now in a separate QueryProvider.
 */

import type { ReactNode } from 'react'

export function SessionProvider({ children }: { children: ReactNode }) {
  // Session provider logic can be added here if needed
  // For now, it's a pass-through component
  return <>{children}</>
}
