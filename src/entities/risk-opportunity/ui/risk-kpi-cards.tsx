import { useQuery } from '@tanstack/solid-query'
import { For, Show, createMemo } from 'solid-js'
import { riskLevelLabel, type RiskLevel } from '@/entities/risk-matrix/model/scoring'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import { opportunityListQueryOptions } from '../api/queries'

const ORDER: RiskLevel[] = ['low', 'moderate', 'high', 'severe']

const TONE: Record<RiskLevel, string> = {
  unknown: 'text-muted-foreground',
  low: 'text-emerald-600 dark:text-emerald-400',
  moderate: 'text-amber-600 dark:text-amber-400',
  high: 'text-orange-600 dark:text-orange-400',
  severe: 'text-red-600 dark:text-red-400',
}

export function RiskKpiCards() {
  const query = useQuery(() => opportunityListQueryOptions())

  const counts = createMemo(() => {
    const data = query.data ?? []
    const byLevel: Record<RiskLevel, number> = {
      unknown: 0,
      low: 0,
      moderate: 0,
      high: 0,
      severe: 0,
    }
    let total = 0
    let scoreSum = 0
    for (const op of data) {
      byLevel[op.level]++
      total++
      scoreSum += op.score
    }
    const avg = total === 0 ? 0 : Math.round((scoreSum / total) * 10) / 10
    return { byLevel, total, avg }
  })

  return (
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <Card class="lg:col-span-2">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            Tổng cơ hội đang theo dõi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-4xl font-bold">{counts().total}</div>
          <Show when={!query.isLoading}>
            <p class="mt-1 text-xs text-muted-foreground">
              Điểm rủi ro trung bình: <span class="font-semibold">{counts().avg}</span>
            </p>
          </Show>
        </CardContent>
      </Card>
      <For each={ORDER}>
        {level => (
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class={`text-sm font-medium ${TONE[level]}`}>
                {riskLevelLabel[level]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-3xl font-bold">{counts().byLevel[level]}</div>
            </CardContent>
          </Card>
        )}
      </For>
    </div>
  )
}
