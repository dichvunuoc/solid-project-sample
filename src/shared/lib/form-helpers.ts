/**
 * Form Helper Utilities
 *
 * Common utilities for form handling, validation, and error display.
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

import { toast } from '@/shared/lib/toast'
import type { FieldErrors, FieldValues } from 'react-hook-form'

/**
 * Display all form errors as toast notifications
 * @param errors - React Hook Form errors object
 * @param options - Display options
 *
 * @example
 * ```tsx
 * const { handleSubmit, formState: { errors } } = useForm()
 *
 * const onSubmit = async (data) => {
 *   if (Object.keys(errors).length > 0) {
 *     displayFormErrors(errors)
 *     return
 *   }
 *   // Continue with submission
 * }
 * ```
 */
export function displayFormErrors<T extends FieldValues>(
  errors: FieldErrors<T>,
  options: {
    title?: string
    showIndividualToasts?: boolean
    maxErrors?: number
  } = {}
): void {
  const { title = 'Form validation failed', showIndividualToasts = false, maxErrors = 5 } = options

  const errorEntries = Object.entries(errors).slice(0, maxErrors)

  if (errorEntries.length === 0) {
    return
  }

  if (showIndividualToasts) {
    // Show individual toast for each error
    errorEntries.forEach(([field, error]) => {
      const message = error?.message as string | undefined
      if (message) {
        toast.error(`${formatFieldName(field)}`, message)
      }
    })
  } else {
    // Show single toast with all errors
    const messages = errorEntries
      .map(([field, error]) => {
        const message = error?.message as string | undefined
        return message ? `• ${formatFieldName(field)}: ${message}` : null
      })
      .filter(Boolean)
      .join('\n')

    if (messages) {
      toast.error(title, messages)
    }
  }
}

/**
 * Format field name for display (converts camelCase to Title Case)
 * @param fieldName - Field name to format
 * @returns Formatted field name
 *
 * @example
 * formatFieldName('firstName') // 'First Name'
 * formatFieldName('emailAddress') // 'Email Address'
 */
export function formatFieldName(fieldName: string): string {
  return (
    fieldName
      // Insert space before capital letters
      .replace(/([A-Z])/g, ' $1')
      // Capitalize first letter
      .replace(/^./, str => str.toUpperCase())
      .trim()
  )
}

/**
 * Convert API error to user-friendly error message
 * @param error - Error from API call
 * @returns User-friendly error message
 *
 * @example
 * ```tsx
 * try {
 *   await apiCall()
 * } catch (error) {
 *   const message = apiErrorToMessage(error)
 *   toast.error('Request failed', message)
 * }
 * ```
 */
export function apiErrorToMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object') {
    // Check for common error response formats
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }

    if ('error' in error && typeof error.error === 'string') {
      return error.error
    }

    if ('detail' in error && typeof error.detail === 'string') {
      return error.detail
    }
  }

  return 'An unexpected error occurred'
}

/**
 * Convert API validation errors to React Hook Form errors format
 * Useful when backend returns field-level validation errors
 *
 * @param apiErrors - API error response with field errors
 * @returns Errors object compatible with React Hook Form
 *
 * @example
 * ```tsx
 * try {
 *   await apiCall(data)
 * } catch (error) {
 *   const formErrors = apiErrorsToFormErrors(error.response.errors)
 *   // Set errors in form
 *   Object.entries(formErrors).forEach(([field, message]) => {
 *     setError(field, { message })
 *   })
 * }
 * ```
 */
export function apiErrorsToFormErrors(
  apiErrors: Record<string, string | string[]> | undefined
): Record<string, string> {
  if (!apiErrors) {
    return {}
  }

  const formErrors: Record<string, string> = {}

  Object.entries(apiErrors).forEach(([field, error]) => {
    if (Array.isArray(error)) {
      formErrors[field] = error[0] ?? 'Invalid value'
    } else if (typeof error === 'string') {
      formErrors[field] = error
    }
  })

  return formErrors
}

/**
 * Check if a form field has an error
 * @param errors - React Hook Form errors object
 * @param fieldName - Field name to check
 * @returns True if field has an error
 */
export function hasFieldError<T extends FieldValues>(
  errors: FieldErrors<T>,
  fieldName: string
): boolean {
  return fieldName in errors
}

/**
 * Get error message for a specific field
 * @param errors - React Hook Form errors object
 * @param fieldName - Field name
 * @returns Error message or undefined
 */
export function getFieldError<T extends FieldValues>(
  errors: FieldErrors<T>,
  fieldName: string
): string | undefined {
  const error = errors[fieldName]
  return error?.message as string | undefined
}

/**
 * Reset form with default values
 * Useful for clearing forms after submission
 *
 * @param reset - React Hook Form reset function
 * @param defaultValues - Default values to reset to
 *
 * @example
 * ```tsx
 * const { reset } = useForm()
 *
 * const onSubmit = async (data) => {
 *   await submitForm(data)
 *   resetFormWithDefaults(reset, { name: '', email: '' })
 *   toast.success('Form submitted successfully')
 * }
 * ```
 */
export function resetFormWithDefaults<T extends FieldValues>(
  reset: (values?: T) => void,
  defaultValues?: T
): void {
  reset(defaultValues)
}

/**
 * Serialize form data to FormData object
 * Useful for file uploads or multipart/form-data submissions
 *
 * @param data - Form data object
 * @returns FormData object
 *
 * @example
 * ```tsx
 * const formData = serializeToFormData({
 *   name: 'John',
 *   avatar: fileObject,
 *   tags: ['tag1', 'tag2']
 * })
 *
 * await fetch('/api/upload', {
 *   method: 'POST',
 *   body: formData
 * })
 * ```
 */
export function serializeToFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach(item => {
        formData.append(key, item)
      })
    } else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value)
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value))
    } else {
      formData.append(key, String(value))
    }
  })

  return formData
}

/**
 * Clean form data by removing empty strings and null values
 * @param data - Form data to clean
 * @returns Cleaned form data
 */
export function cleanFormData<T extends Record<string, unknown>>(data: T): Partial<T> {
  const cleaned: Partial<T> = {}

  Object.entries(data).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key as keyof T] = value as T[keyof T]
    }
  })

  return cleaned
}
