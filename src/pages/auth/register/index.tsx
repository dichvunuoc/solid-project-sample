/**
 * Register Page
 *
 * FSD Rule: Pages compose entities and features.
 */

import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { SignUpForm } from '@/features/auth/sign-up'
import { useSessionContext } from '@/entities/session/ui/session-provider'
import { env } from '@/shared/config/env'
import { authClient } from '@/shared/lib/client-auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { refreshSession } = useSessionContext()
  const [isSuccess, setIsSuccess] = useState(false)
  const [ssoLoading, setSsoLoading] = useState(false)

  const handleSuccess = async () => {
    await refreshSession()
    setIsSuccess(true)
    setTimeout(() => {
      navigate({ to: '/dashboard' })
    }, 2000)
  }

  const handleSsoRegister = async () => {
    setSsoLoading(true)
    try {
      await authClient.signUp.email({
        email: '',
        password: '',
      })
    } catch {
      setSsoLoading(false)
    }
  }

  if (env.VITE_AUTH_MODE === 'keycloak') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Registration is handled by your organization&apos;s identity provider.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <button
              type="button"
              disabled={ssoLoading}
              onClick={() => void handleSsoRegister()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {ssoLoading ? 'Redirecting…' : 'Continue to registration (SSO)'}
            </button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 text-center">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <p className="font-medium">Account created successfully!</p>
            <p className="text-sm mt-1">Redirecting to dashboard...</p>
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <SignUpForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
