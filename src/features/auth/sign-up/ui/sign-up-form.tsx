/**
 * Sign Up Form Feature
 *
 * FSD Rule: Feature UI component for user registration with form validation.
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authClient } from '@/shared/lib/client-auth'
import { toast } from '@/shared/lib/toast'
import { TextField } from '@/shared/ui/forms'
import { Button } from '@/shared/ui/shadcn/button'

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignUpFormData = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function SignUpForm({ onSuccess, onError }: SignUpFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })
      toast.success('Account created successfully', 'Welcome!')
      onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Registration failed')
      toast.error('Registration failed', error.message)
      onError?.(error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        id="name"
        type="text"
        label="Name"
        placeholder="Your name"
        {...register('name')}
        error={errors.name?.message}
        required
      />
      <TextField
        id="email"
        type="email"
        label="Email address"
        placeholder="Email address"
        {...register('email')}
        error={errors.email?.message}
        required
      />
      <TextField
        id="password"
        type="password"
        label="Password"
        placeholder="Password (min. 8 characters)"
        {...register('password')}
        error={errors.password?.message}
        required
      />
      <TextField
        id="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="Confirm password"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
        required
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Creating account...' : 'Sign up'}
      </Button>
    </form>
  )
}
