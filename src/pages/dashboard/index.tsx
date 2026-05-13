/**
 * Dashboard Page — Solid edition.
 */

import { useNavigate } from '@tanstack/solid-router'
import { Show, createEffect } from 'solid-js'
import { FinanceCard } from '@/entities/finance'
import { useSessionContext } from '@/entities/session/ui/session-provider'
import { useDashboardSync } from '@/features/dashboard-sync'
import { ProcessPaymentAction } from '@/features/process-payment'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'

export function DashboardPage() {
  const { session, isLoading, logout } = useSessionContext()
  const navigate = useNavigate()

  useDashboardSync()

  createEffect(() => {
    if (!isLoading() && !session()) {
      void navigate({ to: '/login' })
    }
  })

  const handleLogout = async () => {
    await logout()
    void navigate({ to: '/login' })
  }

  return (
    <Show
      when={!isLoading()}
      fallback={
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-lg">Loading...</div>
        </div>
      }
    >
      <div class="min-h-screen bg-background">
        <div class="container mx-auto px-4 py-16">
          <div class="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardContent class="pt-6">
                <div class="flex justify-between items-center">
                  <div>
                    <h1 class="text-3xl font-bold mb-2">Dashboard</h1>
                    <p class="text-muted-foreground">
                      Welcome, {session()?.user?.name || session()?.user?.email || 'User'}!
                    </p>
                  </div>
                  <Button onClick={handleLogout} variant="destructive">
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2">
                <FinanceCard />
              </div>
              <div class="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div class="space-y-4">
                      <p class="text-sm text-muted-foreground">
                        Click the button below to process a payment. When the payment succeeds,
                        the dashboard stats will automatically update via the event bus.
                      </p>
                      <ProcessPaymentAction />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle class="text-lg">How it works:</CardTitle>
              </CardHeader>
              <CardContent>
                <ol class="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Click "Process Payment" to trigger a payment action</li>
                  <li>
                    The payment feature emits a{' '}
                    <code class="bg-muted px-1 rounded">payment:success</code> or{' '}
                    <code class="bg-muted px-1 rounded">payment:failed</code> event to the shared
                    bus
                  </li>
                  <li>
                    The dashboard-sync feature listens to these events and invalidates the
                    dashboard-stats query
                  </li>
                  <li>
                    The FinanceCard component automatically refetches and updates because its
                    query was invalidated
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Show>
  )
}
