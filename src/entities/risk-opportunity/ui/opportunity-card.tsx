import { For } from 'solid-js'
import { riskLevelLabel, riskLevelTone } from '@/entities/risk-matrix/model/scoring'
import { cn } from '@/shared/lib/utils'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'
import type { Opportunity } from '../model/types'
import { opportunityCategoryLabel } from '../model/types'

interface OpportunityCardProps {
  opportunity: Opportunity
  onSelect?: (id: string) => void
}

export function OpportunityCard(props: OpportunityCardProps) {
  return (
    <Card
      class="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => props.onSelect?.(props.opportunity.id)}
    >
      <CardHeader class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <CardTitle class="text-lg">{props.opportunity.title}</CardTitle>
          <span
            class={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              riskLevelTone[props.opportunity.level]
            )}
          >
            {riskLevelLabel[props.opportunity.level]} · {props.opportunity.score}
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">
            {opportunityCategoryLabel[props.opportunity.category]}
          </Badge>
          <span>Chủ sở hữu: {props.opportunity.owner.name}</span>
        </div>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <p class="line-clamp-3 text-muted-foreground">{props.opportunity.description}</p>
        <div class="flex flex-wrap gap-1.5">
          <For each={props.opportunity.mitigations.slice(0, 3)}>
            {m => (
              <span class="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{m}</span>
            )}
          </For>
        </div>
      </CardContent>
    </Card>
  )
}
