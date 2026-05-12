import { useEffect, type ReactNode } from 'react'
import { SessionProvider } from '@/entities/session/ui/session-provider'
import { initMonitoring } from '@/shared/lib/monitoring'
import { initWebVitals } from '@/shared/lib/web-vitals'
import { ErrorBoundary } from '@/shared/ui/error-boundary'
import { ToastProvider } from '@/shared/ui/toast-provider'
import { EventRegistry } from './providers/event-registry'
import { QueryProvider } from './providers/query-provider'

export function Providers({ children }: { children: ReactNode }) {
  // Initialize monitoring and performance tracking on app start
  useEffect(() => {
    // Initialize error monitoring (Sentry)
    initMonitoring()

    // Initialize Web Vitals performance tracking
    initWebVitals()
  }, [])

  return (
    <ErrorBoundary>
      <QueryProvider>
        <SessionProvider>
          <ToastProvider>
            <EventRegistry />
            {children}
          </ToastProvider>
        </SessionProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}
