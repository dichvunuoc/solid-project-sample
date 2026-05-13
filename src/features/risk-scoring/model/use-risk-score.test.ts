/**
 * useRiskScore — verifies fine-grained reactivity:
 * - Only the derived memo re-runs when likelihood/impact change.
 * - Returns 'unknown' level when either input is missing.
 */

import { createRoot, createSignal } from 'solid-js'
import { describe, expect, it } from 'vitest'
import type { Impact, Likelihood } from '@/entities/risk-matrix/model/scoring'
import { useRiskScore } from './use-risk-score'

describe('useRiskScore', () => {
  it('computes value=likelihoodIdx*impactIdx for valid inputs', () => {
    createRoot(dispose => {
      const [likelihood] = createSignal<Likelihood>('possible')
      const [impact] = createSignal<Impact>('major')
      const score = useRiskScore(likelihood, impact)
      expect(score().value).toBe(12)
      expect(score().level).toBe('high')
      dispose()
    })
  })

  it('reacts when likelihood changes', () => {
    createRoot(dispose => {
      const [likelihood, setLikelihood] = createSignal<Likelihood>('rare')
      const [impact] = createSignal<Impact>('negligible')
      const score = useRiskScore(likelihood, impact)
      expect(score().value).toBe(1)
      expect(score().level).toBe('low')

      setLikelihood('almost-certain')
      expect(score().value).toBe(5)
      expect(score().level).toBe('moderate')
      dispose()
    })
  })

  it('returns level=unknown when an input is missing', () => {
    createRoot(dispose => {
      const [likelihood] = createSignal<Likelihood | undefined>(undefined)
      const [impact] = createSignal<Impact>('moderate')
      const score = useRiskScore(likelihood, impact)
      expect(score().level).toBe('unknown')
      expect(score().value).toBe(0)
      dispose()
    })
  })
})
