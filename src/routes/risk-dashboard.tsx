import { createFileRoute, lazyRouteComponent } from '@tanstack/solid-router'
import { authGuard } from '@/shared/lib/route-guards'

export const Route = createFileRoute('/risk-dashboard')({
  component: lazyRouteComponent(
    () => import('@/pages/risk-dashboard'),
    'RiskDashboardPage'
  ),
  beforeLoad: async () => {
    await authGuard()
  },
})
