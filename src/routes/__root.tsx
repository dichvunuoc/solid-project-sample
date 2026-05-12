import { Suspense } from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Spinner } from '@/shared/ui/spinner'

function RootComponent() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner />
        </div>
      }
    >
      <Outlet />
    </Suspense>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
