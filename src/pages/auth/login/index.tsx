import { useState } from 'react'
import { getRouteApi, Link, useRouter } from '@tanstack/react-router'
import { useSessionContext } from '@/entities/session/ui/session-provider'
import { env } from '@/shared/config/env'
import { toast } from '@/shared/lib/toast'

const loginRouteApi = getRouteApi('/login')

export function LoginPage() {
  const { redirect: redirectTo } = loginRouteApi.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, loginSso } = useSessionContext()

  const afterLoginPath = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'

  const handleSsoLogin = async () => {
    setIsLoading(true)
    try {
      const returnUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}${afterLoginPath}`
          : afterLoginPath
      await loginSso(returnUrl)
    } catch (error) {
      console.error('SSO login error:', error)
      toast.error(
        'Sign-in failed',
        error instanceof Error ? error.message : 'Could not start single sign-on.'
      )
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast.success('Login successful', 'Welcome back!')
      router.history.push(afterLoginPath)
    } catch (error) {
      console.error('Login error:', error)
      toast.error(
        'Login failed',
        error instanceof Error ? error.message : 'Please check your credentials.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (env.VITE_AUTH_MODE === 'keycloak') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              This application uses your organization&apos;s single sign-on (Keycloak).
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void handleSsoLogin()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Redirecting…' : 'Continue with SSO'}
            </button>
            <p className="text-center text-sm text-gray-600">
              After sign-in you will return to{' '}
              <span className="font-medium text-gray-900">{afterLoginPath}</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={e => void handleSubmit(e)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
