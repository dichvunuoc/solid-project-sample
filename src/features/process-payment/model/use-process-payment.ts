/**
 * Process Payment Feature Model
 * 
 * Headless hook that handles payment processing and emits events.
 * 
 * FSD Rule: Feature model contains business logic, not UI.
 */

import { useState } from 'react'
import {
  eventRegistry,
  PaymentSuccessEvent,
  PaymentFailedEvent,
} from '@/shared/api/events'

interface ProcessPaymentParams {
  orderId: string
  amount: number
  userId: string
  paymentMethod: string
}

/**
 * Hook for processing payments
 * 
 * This hook:
 * 1. Performs the payment API call
 * 2. Emits events to the shared bus based on the result
 * 3. Returns loading state and process function
 */
export function useProcessPayment() {
  const [isProcessing, setIsProcessing] = useState(false)

  const processPayment = async (params: ProcessPaymentParams) => {
    setIsProcessing(true)

    try {
      // Simulate API call to payment microservice
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate success/failure (90% success rate for demo)
      const success = Math.random() > 0.1

      if (success) {
        // Emit success event
        const event = new PaymentSuccessEvent({
          orderId: params.orderId,
          amount: params.amount,
          userId: params.userId,
          paymentMethod: params.paymentMethod,
        })
        eventRegistry.emit(event.eventName, event)
      } else {
        // Emit failure event
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
      // Emit failure event if not already emitted
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

  return {
    processPayment,
    isProcessing,
  }
}

