/**
 * Finance Domain Types
 * 
 * FSD Rule: Entity layer defines domain types.
 */

export interface Order {
  id: string
  userId: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

export interface Stat {
  id: string
  label: string
  value: number
  change?: number
  changeType?: 'increase' | 'decrease'
  currency?: boolean
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  recentOrders: Order[]
  stats: Stat[]
}

