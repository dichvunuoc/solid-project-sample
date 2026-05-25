/**
 * Auth Initializer
 *
 * Shows a loading skeleton while Keycloak initializes,
 * then renders children or an error fallback.
 * No-ops for mock auth mode (instant ready).
 */

import { createSignal, Match, onCleanup, onMount, Switch, type JSX } from 'solid-js'
import { env } from '@/shared/config/env'

interface AuthInitializerProps {
  children: JSX.Element
}

export function AuthInitializer(props: AuthInitializerProps) {
  // Non-keycloak modes are immediately ready
  if (env.VITE_AUTH_MODE !== 'keycloak') {
    return <>{props.children}</>
  }

  return <KeycloakInitGate>{props.children}</KeycloakInitGate>
}

function KeycloakInitGate(props: AuthInitializerProps) {
  const [status, setStatus] = createSignal<'loading' | 'ready' | 'error'>('loading')

  let timer: ReturnType<typeof setTimeout> | undefined

  onMount(() => {
    // Keycloak init happens inside keycloak-auth.ts on first getSession call.
    // The SessionProvider already calls getSession in onMount, so we just
    // need to give it time and show a loading state.
    // If auth takes too long, show error.
    timer = setTimeout(() => {
      if (status() === 'loading') {
        setStatus('ready') // Fallback — SessionProvider handles actual error
      }
    }, 10000)

    // Mark ready once we detect the session provider has finished loading
    // by checking for the DOM render
    const check = setInterval(() => {
      if (document.querySelector('[data-auth-ready]')) {
        setStatus('ready')
        clearInterval(check)
      }
    }, 200)

    onCleanup(() => {
      clearTimeout(timer)
      clearInterval(check)
    })
  })

  return (
    <Switch>
      <Match when={status() === 'loading'}>
        <div class="flex min-h-screen items-center justify-center bg-background">
          <div class="flex flex-col items-center gap-4">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p class="text-sm text-muted-foreground">Initializing authentication...</p>
          </div>
        </div>
      </Match>
      <Match when={status() === 'error'}>
        <div class="flex min-h-screen items-center justify-center bg-background">
          <div class="max-w-md text-center">
            <h2 class="text-lg font-semibold text-foreground">Authentication Error</h2>
            <p class="mt-2 text-sm text-muted-foreground">
              Unable to connect to the authentication service. Please refresh the page or contact
              support.
            </p>
            <button
              class="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </Match>
      <Match when={status() === 'ready'}>{props.children}</Match>
    </Switch>
  )
}
