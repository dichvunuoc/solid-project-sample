import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const HomePage = lazy(() => import('@/pages/home').then(module => ({ default: module.HomePage })))

export const Route = createFileRoute('/')({
  component: HomePage,
})
