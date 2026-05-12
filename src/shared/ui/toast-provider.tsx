/**
 * Toast Provider Component
 *
 * Wraps the app with Sonner's Toaster component.
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  )
}
