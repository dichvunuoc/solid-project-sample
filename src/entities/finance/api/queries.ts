/**
 * Finance Entity Queries
 *
 * TanStack Query queryOptions for fetching finance data.
 *
 * FSD Rule: Entity layer defines data fetching logic.
 */

import { queryOptions } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-keys'
import type { DashboardStats, Order } from '../model/types'

/**
 * Mock API function to fetch dashboard stats
 * In a real app, this would call a microservice
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))

  // Get dynamic stats from localStorage (simulating a database)
  const statsKey = 'dashboard_stats'
  const stored = typeof window !== 'undefined' ? localStorage.getItem(statsKey) : null
  const baseStats = stored
    ? JSON.parse(stored)
    : {
        totalRevenue: 125430.5,
        totalOrders: 1243,
        lastPaymentAmount: 0,
        lastPaymentTime: null,
      }

  const totalRevenue = baseStats.totalRevenue
  const totalOrders = baseStats.totalOrders
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    recentOrders: [
      {
        id: '1',
        userId: 'user-1',
        amount: 99.99,
        status: 'completed',
        paymentMethod: 'credit_card',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId: 'user-2',
        amount: 149.5,
        status: 'completed',
        paymentMethod: 'paypal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    stats: [
      {
        id: 'revenue',
        label: 'Total Revenue',
        value: totalRevenue,
        change: 12.5,
        changeType: 'increase',
        currency: true,
      },
      {
        id: 'orders',
        label: 'Total Orders',
        value: totalOrders,
        change: 8.2,
        changeType: 'increase',
      },
      {
        id: 'avg-order',
        label: 'Avg Order Value',
        value: averageOrderValue,
        change: -2.1,
        changeType: 'decrease',
        currency: true,
      },
    ],
  }
}

/**
 * Query options for dashboard stats
 *
 * This query will be invalidated when payment events occur.
 */
export const dashboardStatsQueryOptions = queryOptions({
  queryKey: queryKeys.finance.all(),
  queryFn: fetchDashboardStats,
  staleTime: 0, // Always refetch when invalidated
  refetchOnWindowFocus: true,
})

/**
 * Query options for a specific order
 */
export const orderQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: queryKeys.order.detail(orderId),
    queryFn: async (): Promise<Order> => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        id: orderId,
        userId: 'user-1',
        amount: 99.99,
        status: 'completed',
        paymentMethod: 'credit_card',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    },
  })
