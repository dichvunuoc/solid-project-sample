/**
 * Register Page
 *
 * FSD Rule: Pages compose entities and features.
 */

import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { SignUpForm } from '@/features/auth/sign-up'

export function RegisterPage() {
  const navigate = useNavigate()
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSuccess = () => {
    setIsSuccess(true)
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate({ to: '/dashboard' })
    }, 2000)
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
