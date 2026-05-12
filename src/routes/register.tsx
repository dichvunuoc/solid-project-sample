import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'

const RegisterPage = lazy(() =>
  import('@/pages/auth/register').then(module => ({
    default: module.RegisterPage,
  }))
)

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})
