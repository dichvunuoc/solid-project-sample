/**
 * Finance overview card — Solid edition.
 *
 * Reads `dashboardStatsQueryOptions` via `@tanstack/solid-query`. Renders
 * fine-grained: only the affected number changes when stats refresh.
 */

import { useQuery } from '@tanstack/solid-query'
import { For, Match, Show, Switch } from 'solid-js'
import { Card, CardContent, CardHeader, CardTitle, Spinner } from '@/shared/ui'
import { dashboardStatsQueryOptions } from '../api/queries'
import type { Stat } from '../model/types'

export function FinanceCard() {
  const query = useQuery(() => dashboardStatsQueryOptions)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Switch>
          <Match when={query.isLoading}>
            <div class="flex items-center justify-center py-8">
              <Spinner />
            </div>
          </Match>
          <Match when={query.error}>
            <div class="text-destructive">Error loading finance data</div>
          </Match>
          <Match when={query.data}>
            {data => (
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <For each={data().stats}>{stat => <StatCard stat={stat} />}</For>
                </div>
                <div class="border-t pt-4">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="text-muted-foreground">Total Revenue:</span>
                      <span class="ml-2 font-semibold">
                        $
                        {data().totalRevenue.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div>
                      <span class="text-muted-foreground">Total Orders:</span>
                      <span class="ml-2 font-semibold">
                        {data().totalOrders.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Match>
        </Switch>
      </CardContent>
    </Card>
  )
}

function StatCard(props: { stat: Stat }) {
  const formatValue = (value: number, currency = false) =>
    currency
      ? `$${value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : value.toLocaleString()

  return (
    <div class="bg-muted rounded-lg p-4">
      <div class="text-sm text-muted-foreground mb-1">{props.stat.label}</div>
      <div class="text-2xl font-bold mb-1">
        {formatValue(props.stat.value, props.stat.currency)}
      </div>
      <Show when={props.stat.change !== undefined}>
        <div
          class={`text-sm ${
            props.stat.changeType === 'increase'
              ? 'text-green-600 dark:text-green-500'
              : 'text-red-600 dark:text-red-500'
          }`}
        >
          {props.stat.changeType === 'increase' ? '↑' : '↓'} {Math.abs(props.stat.change ?? 0)}%
        </div>
      </Show>
    </div>
  )
}
