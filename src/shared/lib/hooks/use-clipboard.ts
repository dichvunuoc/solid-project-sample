/**
 * Clipboard Hook
 *
 * Provides copy-to-clipboard functionality with feedback.
 *
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

import { useState, useCallback } from 'react'
import { toast } from '@/shared/lib/toast'

interface UseClipboardOptions {
  timeout?: number
  successMessage?: string
  errorMessage?: string
  showToast?: boolean
}

/**
 * Copy text to clipboard with feedback
 * @param options - Configuration options
 * @returns Object with isCopied state and copy function
 *
 * @example
 * ```tsx
 * const { isCopied, copy } = useClipboard()
 *
 * return (
 *   <button onClick={() => copy('Hello World')}>
 *     {isCopied ? 'Copied!' : 'Copy'}
 *   </button>
 * )
 * ```
 */
export function useClipboard(options: UseClipboardOptions = {}) {
  const {
    timeout = 2000,
    successMessage = 'Copied to clipboard',
    errorMessage = 'Failed to copy to clipboard',
    showToast = true,
  } = options

  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const copy = useCallback(
    async (text: string) => {
      // Reset error state
      setError(null)

      try {
        // Modern clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
        } else {
          // Fallback for older browsers or non-HTTPS contexts
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()

          try {
            document.execCommand('copy')
          } catch {
            throw new Error('Failed to copy using fallback method')
          } finally {
            document.body.removeChild(textArea)
          }
        }

        setIsCopied(true)

        if (showToast) {
          toast.success('Copied', successMessage)
        }

        // Reset copied state after timeout
        setTimeout(() => {
          setIsCopied(false)
        }, timeout)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        setIsCopied(false)

        if (showToast) {
          toast.error('Copy failed', errorMessage)
        }

        throw error
      }
    },
    [timeout, successMessage, errorMessage, showToast]
  )

  return { isCopied, copy, error }
}
