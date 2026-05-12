import { lazy } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
})

const LoginPage = lazy(() =>
  import('@/pages/auth/login').then(module => ({ default: module.LoginPage }))
)

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
})
