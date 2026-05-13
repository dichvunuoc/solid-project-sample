/**
 * Risk Matrix cell — pure presentational.
 */

import { type JSX } from 'solid-js'
import { Show } from 'solid-js'
import { cn } from '@/shared/lib/utils'
import {
  computeRiskScore,
  riskLevelTone,
  type Impact,
  type Likelihood,
} from '../model/scoring'

interface RiskCellProps {
  likelihood: Likelihood
  impact: Impact
  count?: number
  onClick?: () => void
  children?: JSX.Element
  selected?: boolean
}

export function RiskCell(props: RiskCellProps) {
  const score = () => computeRiskScore(props.likelihood, props.impact)
  return (
    <button
      type="button"
      onClick={props.onClick}
      class={cn(
        'rounded p-2 text-left transition-colors border border-transparent hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring',
        riskLevelTone[score().level],
        props.selected && 'ring-2 ring-foreground'
      )}
      aria-label={`Mức rủi ro ${score().value}`}
    >
      <div class="text-xs opacity-70">{score().value}</div>
      <Show when={props.count !== undefined} fallback={<div class="font-medium">{props.children}</div>}>
        <div class="font-bold text-base">{props.count}</div>
      </Show>
    </button>
  )
}
