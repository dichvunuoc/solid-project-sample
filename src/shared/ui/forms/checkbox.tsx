/**
 * Checkbox Component
 *
 * Reusable checkbox component that integrates with React Hook Form.
 */

import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const baseStyles =
      'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors'
    const errorStyles = 'border-red-300 focus:ring-red-500'

    return (
      <div className="w-full">
        <div className="flex items-start">
          <input
            ref={ref}
            type="checkbox"
            className={`${baseStyles} ${error ? errorStyles : ''} ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error || helperText ? `${props.id}-${error ? 'error' : 'helper'}` : undefined
            }
            {...props}
          />
          {label && (
            <label htmlFor={props.id} className="ml-2 block text-sm text-gray-700">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
        </div>
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

Checkbox.displayName = 'Checkbox'
