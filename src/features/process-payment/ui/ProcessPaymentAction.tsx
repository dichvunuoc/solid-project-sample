/**
 * Process Payment Action — Solid edition.
 *
 * UI shim that calls into the feature model and surfaces the result.
 */

import { Show, createSignal } from 'solid-js'
import { Button } from '@/shared/ui'
import { useProcessPayment } from '../model/use-process-payment'

interface ProcessPaymentActionProps {
  orderId?: string
  amount?: number
  userId?: string
  paymentMethod?: string
}

export function ProcessPaymentAction(props: ProcessPaymentActionProps) {
  const { processPayment, isProcessing } = useProcessPayment()
  const [lastResult, setLastResult] = createSignal<'success' | 'failed' | null>(null)

  const handleProcessPayment = async () => {
    setLastResult(null)
    try {
      await processPayment({
        orderId: props.orderId ?? `order-${Date.now()}`,
        amount: props.amount ?? 99.99,
        userId: props.userId ?? 'user-1',
        paymentMethod: props.paymentMethod ?? 'credit_card',
      })
      setLastResult('success')
    } catch {
      setLastResult('failed')
    }
  }

  return (
    <div class="space-y-2">
      <Button
        onClick={handleProcessPayment}
        disabled={isProcessing()}
        variant="default"
        class="w-full"
      >
        <Show when={isProcessing()} fallback="Process Payment">
          Processing...
        </Show>
      </Button>
      <Show when={lastResult() === 'success'}>
        <div class="text-sm text-green-600 dark:text-green-500">
          Payment processed successfully!
        </div>
      </Show>
      <Show when={lastResult() === 'failed'}>
        <div class="text-sm text-destructive">Payment failed. Please try again.</div>
      </Show>
    </div>
  )
}
