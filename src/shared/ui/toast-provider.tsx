/**
 * Toast Provider (Solid).
 */

import { Toaster } from 'solid-sonner'
import type { JSX } from 'solid-js'

export function ToastProvider(props: { children: JSX.Element }) {
  return (
    <>
      {props.children}
      <Toaster position="top-right" richColors />
    </>
  )
}
