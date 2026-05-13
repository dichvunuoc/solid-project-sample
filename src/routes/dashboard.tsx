import { createFileRoute, lazyRouteComponent } from '@tanstack/solid-router'
import { authGuard } from '@/shared/lib/route-guards'

export const Route = createFileRoute('/dashboard')({
  component: lazyRouteComponent(() => import('@/pages/dashboard'), 'DashboardPage'),
  beforeLoad: async () => {
    await authGuard()
  },
})
