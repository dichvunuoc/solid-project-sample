/**
 * Legacy base Button component (Solid).
 *
 * Kept for backward compatibility with `@/shared/ui/button` consumers that
 * existed before the shadcn folder. New code should import from
 * `@/shared/ui/shadcn/button`.
 */

import { splitProps, type ComponentProps, type JSX } from 'solid-js'

interface ButtonProps extends Omit<ComponentProps<'button'>, 'class'> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  class?: string
  children?: JSX.Element
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
} satisfies Record<NonNullable<ButtonProps['variant']>, string>

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} satisfies Record<NonNullable<ButtonProps['size']>, string>

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ['variant', 'size', 'class', 'children'])
  const base =
    'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  return (
    <button
      class={`${base} ${variantStyles[local.variant ?? 'primary']} ${sizeStyles[local.size ?? 'md']} ${local.class ?? ''}`}
      {...rest}
    >
      {local.children}
    </button>
  )
}
