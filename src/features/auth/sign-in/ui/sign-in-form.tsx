// Example feature component following FSD
// This demonstrates how to organize auth features with form validation

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authClient } from '@/shared/lib/client-auth'
import { toast } from '@/shared/lib/toast'
import { TextField } from '@/shared/ui/forms'
import { Button } from '@/shared/ui/shadcn/button'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SignInFormData = z.infer<typeof signInSchema>

export function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    try {
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })
      toast.success('Sign in successful', 'Welcome back!')
    } catch (error) {
      toast.error(
        'Sign in failed',
        error instanceof Error ? error.message : 'Please check your credentials.'
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        id="email"
        type="email"
        label="Email"
        placeholder="Email"
        {...register('email')}
        error={errors.email?.message}
        required
      />
      <TextField
        id="password"
        type="password"
        label="Password"
        placeholder="Password"
        {...register('password')}
        error={errors.password?.message}
        required
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
