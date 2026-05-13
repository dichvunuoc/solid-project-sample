/**
 * Reactive risk-score memo.
 *
 * Takes two accessors (likelihood, impact) and returns a memoised accessor
 * that recomputes only when either input changes. Used by both the
 * assessment form (live preview) and the matrix tooltip.
 */

import { createMemo, type Accessor } from 'solid-js'
import {
  computeRiskScore,
  levelFromValue,
  type Impact,
  type Likelihood,
  type RiskScore,
} from '@/entities/risk-matrix/model/scoring'

export function useRiskScore(
  likelihood: Accessor<Likelihood | undefined>,
  impact: Accessor<Impact | undefined>
): Accessor<RiskScore> {
  return createMemo<RiskScore>(() => {
    const l = likelihood()
    const i = impact()
    if (!l || !i) return { value: 0, level: 'unknown' }
    return computeRiskScore(l, i)
  })
}

export { computeRiskScore, levelFromValue }
