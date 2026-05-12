/**
 * Dashboard Page
 *
 * Composes Entities and Features to create the full dashboard experience.
 *
 * FSD Rule: Pages compose entities and features, they don't contain business logic.
 */

import { useNavigate } from '@tanstack/react-router'
import { useDashboardSync } from '@/features/dashboard-sync'
import { ProcessPaymentAction } from '@/features/process-payment'
import { FinanceCard } from '@/entities/finance'
import { useSessionContext } from '@/entities/session/ui/session-provider'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/shared/ui'

export function DashboardPage() {
  const { session, isLoading, logout } = useSessionContext()
  const navigate = useNavigate()

  // Orchestrator: Listen to events and sync dashboard data
  useDashboardSync()

  // Redirect to login if not authenticated
  if (!isLoading && !session) {
    navigate({ to: '/login' })
    return null
  }

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Welcome, {session?.user?.name || session?.user?.email || 'User'}!
                  </p>
                </div>
                <Button onClick={handleLogout} variant="destructive">
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Finance Entity - Takes 2 columns */}
            <div className="lg:col-span-2">
              <FinanceCard />
            </div>

            {/* Process Payment Feature - Takes 1 column */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Click the button below to process a payment. When the payment succeeds, the
                      dashboard stats will automatically update via the event bus.
                    </p>
                    <ProcessPaymentAction />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How it works:</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click &quot;Process Payment&quot; to trigger a payment action</li>
                <li>
                  The payment feature emits a{' '}
                  <code className="bg-muted px-1 rounded">payment:success</code> or{' '}
                  <code className="bg-muted px-1 rounded">payment:failed</code> event to the shared
                  bus
                </li>
                <li>
                  The dashboard-sync feature listens to these events and invalidates the
                  dashboard-stats query
                </li>
                <li>
                  The FinanceCard component automatically refetches and updates because its query
                  was invalidated
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
