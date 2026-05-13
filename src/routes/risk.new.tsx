import { createFileRoute, lazyRouteComponent } from '@tanstack/solid-router'
import { authGuard } from '@/shared/lib/route-guards'

export const Route = createFileRoute('/risk/new')({
  component: lazyRouteComponent(() => import('@/pages/risk-new'), 'RiskNewPage'),
  beforeLoad: async () => {
    await authGuard()
  },
})
