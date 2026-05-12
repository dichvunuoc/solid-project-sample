/**
 * Dashboard Sync Feature Model
 *
 * Headless hook that listens to bus events and orchestrates TanStack Query cache updates.
 *
 * FSD Rule: Feature model contains orchestration logic, not UI.
 * This hook remains active at the top level of the Dashboard page.
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { DashboardStats } from '@/entities/finance/model/types'
import {
  eventRegistry,
  PAYMENT_SUCCESS,
  PAYMENT_FAILED,
  type PaymentSuccessEvent,
  type PaymentFailedEvent,
} from '@/shared/api/events'
import { queryKeys } from '@/shared/api/query-keys'
import { logger } from '@/shared/lib/logger'

/**
 * Hook that syncs dashboard data based on events
 *
 * This hook:
 * 1. Listens to payment events from the shared bus
 * 2. Invalidates relevant queries when events occur
 * 3. Optionally updates query data directly for optimistic updates
 *
 * Usage: Call this hook at the top level of the Dashboard page.
 */
export function useDashboardSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Handler for payment success events
    const handlePaymentSuccess = (event: PaymentSuccessEvent) => {
      logger.info('Payment success event received:', event.orderId)

      // Update localStorage with new payment (simulating database update)
      const statsKey = 'dashboard_stats'
      const stored = typeof window !== 'undefined' ? localStorage.getItem(statsKey) : null
      const currentStats = stored
        ? JSON.parse(stored)
        : {
            totalRevenue: 125430.5,
            totalOrders: 1243,
            lastPaymentAmount: 0,
            lastPaymentTime: null,
          }

      const updatedStats = {
        totalRevenue: currentStats.totalRevenue + event.amount,
        totalOrders: currentStats.totalOrders + 1,
        lastPaymentAmount: event.amount,
        lastPaymentTime: new Date().toISOString(),
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(statsKey, JSON.stringify(updatedStats))
      }

      // Optimistic update - immediately update the UI
      queryClient.setQueryData(queryKeys.finance.all(), (oldData: DashboardStats | undefined) => {
        if (!oldData) {
          // If no old data, refetch instead
          queryClient.invalidateQueries({
            queryKey: queryKeys.finance.all(),
          })
          return
        }
        const newTotalRevenue = oldData.totalRevenue + event.amount
        const newTotalOrders = oldData.totalOrders + 1
        const newAvgOrderValue = newTotalOrders > 0 ? newTotalRevenue / newTotalOrders : 0

        return {
          ...oldData,
          totalRevenue: newTotalRevenue,
          totalOrders: newTotalOrders,
          averageOrderValue: newAvgOrderValue,
          stats: oldData.stats.map(stat => {
            if (stat.id === 'revenue') {
              return { ...stat, value: newTotalRevenue }
            }
            if (stat.id === 'orders') {
              return { ...stat, value: newTotalOrders }
            }
            if (stat.id === 'avg-order') {
              return { ...stat, value: newAvgOrderValue }
            }
            return stat
          }),
        }
      })

      // Also invalidate to ensure we get fresh data on next render
      queryClient.invalidateQueries({
        queryKey: queryKeys.finance.all(),
      })

      // Invalidate the specific order query
      queryClient.invalidateQueries({
        queryKey: queryKeys.order.detail(event.orderId),
      })
    }

    // Handler for payment failure events
    const handlePaymentFailed = (event: PaymentFailedEvent) => {
      logger.warn('Payment failed event received:', event.orderId)

      // Invalidate queries to ensure UI reflects the failed state
      queryClient.invalidateQueries({
        queryKey: queryKeys.finance.all(),
      })

      queryClient.invalidateQueries({
        queryKey: queryKeys.order.detail(event.orderId),
      })
    }

    // Subscribe to events
    eventRegistry.on(PAYMENT_SUCCESS, handlePaymentSuccess)
    eventRegistry.on(PAYMENT_FAILED, handlePaymentFailed)

    // Cleanup: Unsubscribe when component unmounts
    return () => {
      eventRegistry.off(PAYMENT_SUCCESS, handlePaymentSuccess)
      eventRegistry.off(PAYMENT_FAILED, handlePaymentFailed)
    }
  }, [queryClient])
}
