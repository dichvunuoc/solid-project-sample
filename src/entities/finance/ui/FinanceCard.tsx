/**
 * Finance Card Component
 *
 * Pure presentational component for displaying finance statistics.
 *
 * FSD Rule: Entity UI components are presentational only.
 */

import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, Spinner } from '@/shared/ui'
import { dashboardStatsQueryOptions } from '../api/queries'
import type { Stat } from '../model/types'

export function FinanceCard() {
  const { data, isLoading, error } = useQuery(dashboardStatsQueryOptions)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Finance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Finance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error loading finance data</div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.stats.map(stat => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Revenue:</span>
                <span className="ml-2 font-semibold">
                  $
                  {data.totalRevenue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Orders:</span>
                <span className="ml-2 font-semibold">{data.totalOrders.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({ stat }: { stat: Stat }) {
  const formatValue = (value: number, currency = false) => {
    if (currency) {
      return `$${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }
    return value.toLocaleString()
  }

  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
      <div className="text-2xl font-bold mb-1">{formatValue(stat.value, stat.currency)}</div>
      {stat.change !== undefined && (
        <div
          className={`text-sm ${
            stat.changeType === 'increase'
              ? 'text-green-600 dark:text-green-500'
              : 'text-red-600 dark:text-red-500'
          }`}
        >
          {stat.changeType === 'increase' ? '↑' : '↓'} {Math.abs(stat.change)}%
        </div>
      )}
    </div>
  )
}
