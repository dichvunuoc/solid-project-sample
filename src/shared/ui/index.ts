/**
 * Shared UI Components
 *
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 *
 * Main exports now use Shadcn UI components for consistency.
 */

// Shadcn UI Components (primary exports)
// Note: ToastProvider from shadcn/toast is excluded to avoid conflict
export * from './shadcn/alert'
export * from './shadcn/avatar'
export * from './shadcn/badge'
export * from './shadcn/button'
export * from './shadcn/card'
export * from './shadcn/checkbox'
export * from './shadcn/dialog'
export * from './shadcn/dropdown-menu'
export * from './shadcn/form'
export * from './shadcn/input'
export * from './shadcn/label'
export * from './shadcn/pagination'
export * from './shadcn/popover'
export * from './shadcn/radio-group'
export * from './shadcn/scroll-area'
export * from './shadcn/select'
export * from './shadcn/separator'
export * from './shadcn/sheet'
export * from './shadcn/skeleton'
export * from './shadcn/table'
export * from './shadcn/tabs'
export * from './shadcn/accordion'
export * from './shadcn/toaster'
// Export Toast components but not ToastProvider to avoid conflict
export {
  type ToastProps,
  type ToastActionElement,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './shadcn/toast'

// Custom components
export { Spinner } from './spinner'
export { ErrorBoundary } from './error-boundary'
export { ToastProvider } from './toast-provider'

// Legacy form components (TextField, Radio)
// Note: Checkbox, Select, Textarea are now exported from Shadcn
export { TextField } from './forms/text-field'
export { Radio } from './forms/radio'
