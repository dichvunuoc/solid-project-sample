/**
 * Root composition of providers. Solid edition.
 */

import { onMount, type JSX } from 'solid-js'
import { AuthInitializer } from '@/entities/session/ui/auth-initializer'
import { SessionProvider } from '@/entities/session/ui/session-provider'
import { initMonitoring } from '@/shared/lib/monitoring'
import { initWebVitals } from '@/shared/lib/web-vitals'
import { ErrorBoundary } from '@/shared/ui/error-boundary'
import { ToastProvider } from '@/shared/ui/toast-provider'
import { EventRegistry } from './providers/event-registry'
import { QueryProvider } from './providers/query-provider'

export function Providers(props: { children: JSX.Element }) {
  onMount(() => {
    void initMonitoring()
    initWebVitals()
  })

  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthInitializer>
          <SessionProvider>
            <ToastProvider>
              <EventRegistry />
              {props.children}
            </ToastProvider>
          </SessionProvider>
        </AuthInitializer>
      </QueryProvider>
    </ErrorBoundary>
  )
}
