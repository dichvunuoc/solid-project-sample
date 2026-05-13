/**
 * Dashboard Sync — Solid edition.
 *
 * Listens to the shared payment event bus and orchestrates TanStack Solid
 * Query cache updates. Mounted at the top level of the Dashboard page.
 */

import { useQueryClient } from '@tanstack/solid-query'
import { onCleanup, onMount } from 'solid-js'
import type { DashboardStats } from '@/entities/finance/model/types'
import {
  PAYMENT_FAILED,
  PAYMENT_SUCCESS,
  eventRegistry,
  type PaymentFailedEvent,
  type PaymentSuccessEvent,
} from '@/shared/api/events'
import { queryKeys } from '@/shared/api/query-keys'
import { logger } from '@/shared/lib/logger'

export function useDashboardSync() {
  const queryClient = useQueryClient()

  onMount(() => {
    const handlePaymentSuccess = (event: PaymentSuccessEvent) => {
      logger.info('Payment success event received:', event.orderId)

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

      queryClient.setQueryData(
        queryKeys.finance.all(),
        (oldData: DashboardStats | undefined) => {
          if (!oldData) {
            queryClient.invalidateQueries({ queryKey: queryKeys.finance.all() })
            return
          }
          const newTotalRevenue = oldData.totalRevenue + event.amount
          const newTotalOrders = oldData.totalOrders + 1
          const newAvg = newTotalOrders > 0 ? newTotalRevenue / newTotalOrders : 0

          return {
            ...oldData,
            totalRevenue: newTotalRevenue,
            totalOrders: newTotalOrders,
            averageOrderValue: newAvg,
            stats: oldData.stats.map(stat => {
              if (stat.id === 'revenue') return { ...stat, value: newTotalRevenue }
              if (stat.id === 'orders') return { ...stat, value: newTotalOrders }
              if (stat.id === 'avg-order') return { ...stat, value: newAvg }
              return stat
            }),
          }
        }
      )

      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(event.orderId) })
    }

    const handlePaymentFailed = (event: PaymentFailedEvent) => {
      logger.warn('Payment failed event received:', event.orderId)
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.order.detail(event.orderId) })
    }

    eventRegistry.on(PAYMENT_SUCCESS, handlePaymentSuccess)
    eventRegistry.on(PAYMENT_FAILED, handlePaymentFailed)

    onCleanup(() => {
      eventRegistry.off(PAYMENT_SUCCESS, handlePaymentSuccess)
      eventRegistry.off(PAYMENT_FAILED, handlePaymentFailed)
    })
  })
}
