/**
 * Process Payment Action Component
 *
 * UI component that triggers payment processing via the feature model.
 *
 * FSD Rule: Feature UI components trigger actions, not business logic.
 */

import { useState } from 'react'
import { Button } from '@/shared/ui'
import { useProcessPayment } from '../model/use-process-payment'

interface ProcessPaymentActionProps {
  orderId?: string
  amount?: number
  userId?: string
  paymentMethod?: string
}

export function ProcessPaymentAction({
  orderId = `order-${Date.now()}`,
  amount = 99.99,
  userId = 'user-1',
  paymentMethod = 'credit_card',
}: ProcessPaymentActionProps) {
  const { processPayment, isProcessing } = useProcessPayment()
  const [lastResult, setLastResult] = useState<'success' | 'failed' | null>(null)

  const handleProcessPayment = async () => {
    try {
      setLastResult(null)
      await processPayment({
        orderId,
        amount,
        userId,
        paymentMethod,
      })
      setLastResult('success')
    } catch {
      setLastResult('failed')
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleProcessPayment}
        disabled={isProcessing}
        variant="default"
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Process Payment'}
      </Button>
      {lastResult === 'success' && (
        <div className="text-sm text-green-600 dark:text-green-500">
          Payment processed successfully!
        </div>
      )}
      {lastResult === 'failed' && (
        <div className="text-sm text-destructive">Payment failed. Please try again.</div>
      )}
    </div>
  )
}
