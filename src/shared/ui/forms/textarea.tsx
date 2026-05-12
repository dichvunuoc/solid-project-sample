/**
 * Textarea Component
 *
 * Reusable textarea component that integrates with React Hook Form.
 */

import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const baseStyles =
      'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm transition-colors resize-y'
    const normalStyles = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    const errorStyles = 'border-red-300 focus:ring-red-500 focus:border-red-500'

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseStyles} ${error ? errorStyles : normalStyles} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error || helperText ? `${props.id}-${error ? 'error' : 'helper'}` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
