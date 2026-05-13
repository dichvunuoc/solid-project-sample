/**
 * Process Payment — Solid edition.
 *
 * Returns `isProcessing` as a reactive accessor and a plain async
 * `processPayment` function (no closure-over-state issues because Solid
 * component bodies run once).
 */

import { createSignal, type Accessor } from 'solid-js'
import {
  PaymentFailedEvent,
  PaymentSuccessEvent,
  eventRegistry,
} from '@/shared/api/events'

interface ProcessPaymentParams {
  orderId: string
  amount: number
  userId: string
  paymentMethod: string
}

export interface UseProcessPaymentResult {
  processPayment: (params: ProcessPaymentParams) => Promise<void>
  isProcessing: Accessor<boolean>
}

export function useProcessPayment(): UseProcessPaymentResult {
  const [isProcessing, setIsProcessing] = createSignal(false)

  const processPayment = async (params: ProcessPaymentParams) => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const success = Math.random() > 0.1
      if (success) {
        const event = new PaymentSuccessEvent({
          orderId: params.orderId,
          amount: params.amount,
          userId: params.userId,
          paymentMethod: params.paymentMethod,
        })
        eventRegistry.emit(event.eventName, event)
      } else {
        const event = new PaymentFailedEvent({
          orderId: params.orderId,
          userId: params.userId,
          error: 'Payment processing failed',
          reason: 'Insufficient funds or card declined',
        })
        eventRegistry.emit(event.eventName, event)
        throw new Error('Payment failed')
      }
    } catch (error) {
      const event = new PaymentFailedEvent({
        orderId: params.orderId,
        userId: params.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        reason: 'Payment processing error',
      })
      eventRegistry.emit(event.eventName, event)
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  return { processPayment, isProcessing }
}
