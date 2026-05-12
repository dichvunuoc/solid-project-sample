import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const LoginPage = lazy(() =>
  import('@/pages/auth/login').then(module => ({ default: module.LoginPage }))
)

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
