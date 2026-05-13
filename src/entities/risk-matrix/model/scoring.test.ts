import { describe, expect, it } from 'vitest'
import { computeRiskScore, levelFromValue } from './scoring'

describe('levelFromValue', () => {
  it.each([
    [0, 'unknown'],
    [1, 'low'],
    [4, 'low'],
    [5, 'moderate'],
    [9, 'moderate'],
    [10, 'high'],
    [15, 'high'],
    [16, 'severe'],
    [25, 'severe'],
  ] as const)('value=%i → %s', (value, expected) => {
    expect(levelFromValue(value)).toBe(expected)
  })
})

describe('computeRiskScore', () => {
  it('multiplies 1-based indices of the scales', () => {
    expect(computeRiskScore('rare', 'negligible').value).toBe(1)
    expect(computeRiskScore('almost-certain', 'severe').value).toBe(25)
    expect(computeRiskScore('possible', 'major')).toEqual({
      value: 12,
      level: 'high',
    })
  })
})
