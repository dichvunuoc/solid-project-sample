import { useQuery } from '@tanstack/solid-query'
import { For, createMemo } from 'solid-js'
import {
  computeRiskScore,
  impactLabel,
  impactScale,
  likelihoodLabel,
  likelihoodScale,
  riskLevelTone,
} from '@/entities/risk-matrix/model/scoring'
import { opportunityListQueryOptions } from '@/entities/risk-opportunity/api/queries'
import type { Opportunity } from '@/entities/risk-opportunity/model/types'
import { cn } from '@/shared/lib/utils'

export function RiskMatrixGrid() {
  const query = useQuery(() => opportunityListQueryOptions())

  const bucketed = createMemo(() => {
    const grid: Record<string, Opportunity[]> = {}
    for (const op of query.data ?? []) {
      const key = `${op.likelihood}|${op.impact}`
      ;(grid[key] ??= []).push(op)
    }
    return grid
  })

  return (
    <div class="overflow-x-auto">
      <div class="grid min-w-[640px] grid-cols-[12rem_repeat(5,minmax(0,1fr))] gap-1 text-xs">
        <div />
        <For each={impactScale}>
          {impact => (
            <div class="text-center font-semibold text-muted-foreground">
              {impactLabel[impact]}
            </div>
          )}
        </For>

        <For each={likelihoodScale}>
          {likelihood => (
            <>
              <div class="flex items-center pr-2 text-right font-semibold text-muted-foreground">
                {likelihoodLabel[likelihood]}
              </div>
              <For each={impactScale}>
                {impact => {
                  const items = () => bucketed()[`${likelihood}|${impact}`] ?? []
                  const score = computeRiskScore(likelihood, impact)
                  return (
                    <div
                      class={cn(
                        'rounded p-2 transition-colors min-h-[60px] flex flex-col gap-1',
                        riskLevelTone[score.level]
                      )}
                      title={`${likelihoodLabel[likelihood]} × ${impactLabel[impact]} = ${score.value}`}
                    >
                      <div class="text-[10px] uppercase opacity-70">{score.value}</div>
                      <div class="text-lg font-bold leading-none">{items().length}</div>
                    </div>
                  )
                }}
              </For>
            </>
          )}
        </For>
      </div>
    </div>
  )
}
