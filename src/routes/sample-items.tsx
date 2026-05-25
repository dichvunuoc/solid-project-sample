import { createFileRoute, lazyRouteComponent } from '@tanstack/solid-router'
import { authGuard } from '@/shared/lib/route-guards'

export const Route = createFileRoute('/sample-items')({
  beforeLoad: async () => {
    await authGuard()
  },
  component: lazyRouteComponent(() => import('@/pages/sample-items'), 'SampleItemsPage'),
})
