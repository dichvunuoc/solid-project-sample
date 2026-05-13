import { createFileRoute, lazyRouteComponent } from '@tanstack/solid-router'

export const Route = createFileRoute('/')({
  component: lazyRouteComponent(() => import('@/pages/home'), 'HomePage'),
})
