import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { authGuard } from '@/shared/lib/route-guards'

const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then(module => ({
    default: module.DashboardPage,
  }))
)

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  beforeLoad: async () => {
    // Protect route - redirect to login if not authenticated
    await authGuard()
  },
})
