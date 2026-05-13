import { useQuery } from '@tanstack/solid-query'
import { createVirtualizer } from '@tanstack/solid-virtual'
import { For, Show, createMemo } from 'solid-js'
import { riskLevelLabel, riskLevelTone } from '@/entities/risk-matrix/model/scoring'
import { opportunityListQueryOptions } from '@/entities/risk-opportunity/api/queries'
import { opportunityCategoryLabel } from '@/entities/risk-opportunity/model/types'
import type { Opportunity } from '@/entities/risk-opportunity/model/types'
import { cn } from '@/shared/lib/utils'

interface OpportunityTableProps {
  filters?: Parameters<typeof opportunityListQueryOptions>[0]
}

export function OpportunityTable(props: OpportunityTableProps) {
  const query = useQuery(() => opportunityListQueryOptions(props.filters))
  let parentRef!: HTMLDivElement

  const rows = createMemo<Opportunity[]>(() => query.data ?? [])

  const virtualizer = createVirtualizer({
    get count() {
      return rows().length
    },
    getScrollElement: () => parentRef,
    estimateSize: () => 64,
    overscan: 8,
  })

  return (
    <div class="rounded-md border">
      <div class="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b bg-muted/50 px-4 py-2 text-xs font-semibold text-muted-foreground">
        <span>Cơ hội</span>
        <span>Danh mục</span>
        <span>Chủ sở hữu</span>
        <span>Điểm</span>
        <span>Mức rủi ro</span>
      </div>
      <div ref={parentRef} class="h-[480px] overflow-auto">
        <Show
          when={rows().length > 0}
          fallback={
            <div class="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Show when={query.isLoading} fallback="Chưa có cơ hội nào khớp bộ lọc.">
                Đang tải...
              </Show>
            </div>
          }
        >
          <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
            <For each={virtualizer.getVirtualItems()}>
              {vi => {
                const op = () => rows()[vi.index]
                return (
                  <Show when={op()}>
                    {opp => (
                      <div
                        style={{
                          position: 'absolute',
                          top: `${vi.start}px`,
                          height: `${vi.size}px`,
                          width: '100%',
                        }}
                        class="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b px-4 text-sm"
                      >
                        <div class="min-w-0">
                          <div class="truncate font-medium">{opp().title}</div>
                          <div class="truncate text-xs text-muted-foreground">
                            {opp().description}
                          </div>
                        </div>
                        <div class="text-muted-foreground">
                          {opportunityCategoryLabel[opp().category]}
                        </div>
                        <div class="text-muted-foreground">{opp().owner.name}</div>
                        <div class="font-semibold">{opp().score}</div>
                        <div>
                          <span
                            class={cn(
                              'rounded-full px-2 py-0.5 text-xs font-semibold',
                              riskLevelTone[opp().level]
                            )}
                          >
                            {riskLevelLabel[opp().level]}
                          </span>
                        </div>
                      </div>
                    )}
                  </Show>
                )
              }}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}
