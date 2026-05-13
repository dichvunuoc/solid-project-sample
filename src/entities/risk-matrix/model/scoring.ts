/**
 * Risk Matrix scoring — pure functions.
 *
 * The matrix is a 5×5 grid of (likelihood × impact) → risk level. The numeric
 * score is computed as `(likelihoodIndex + 1) * (impactIndex + 1)`, yielding
 * 1–25. We bucket that range into 4 levels: low (≤4), moderate (5–9),
 * high (10–15), severe (≥16).
 */

export const likelihoodScale = [
  'rare',
  'unlikely',
  'possible',
  'likely',
  'almost-certain',
] as const
export const impactScale = ['negligible', 'minor', 'moderate', 'major', 'severe'] as const

export type Likelihood = (typeof likelihoodScale)[number]
export type Impact = (typeof impactScale)[number]
export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe' | 'unknown'

export interface RiskScore {
  value: number
  level: RiskLevel
}

export const likelihoodLabel: Record<Likelihood, string> = {
  rare: 'Hiếm khi',
  unlikely: 'Khó xảy ra',
  possible: 'Có thể',
  likely: 'Dễ xảy ra',
  'almost-certain': 'Gần như chắc chắn',
}

export const impactLabel: Record<Impact, string> = {
  negligible: 'Không đáng kể',
  minor: 'Nhẹ',
  moderate: 'Vừa',
  major: 'Lớn',
  severe: 'Nghiêm trọng',
}

export const riskLevelLabel: Record<RiskLevel, string> = {
  unknown: 'Chưa xác định',
  low: 'Thấp',
  moderate: 'Trung bình',
  high: 'Cao',
  severe: 'Rất cao',
}

export const riskLevelTone: Record<RiskLevel, string> = {
  unknown: 'bg-muted text-muted-foreground',
  low: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
  moderate: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
  high: 'bg-orange-200 text-orange-950 dark:bg-orange-900/60 dark:text-orange-50',
  severe: 'bg-red-200 text-red-950 dark:bg-red-900/70 dark:text-red-50',
}

export function levelFromValue(value: number): RiskLevel {
  if (value <= 0) return 'unknown'
  if (value <= 4) return 'low'
  if (value <= 9) return 'moderate'
  if (value <= 15) return 'high'
  return 'severe'
}

export function computeRiskScore(likelihood: Likelihood, impact: Impact): RiskScore {
  const l = likelihoodScale.indexOf(likelihood) + 1
  const i = impactScale.indexOf(impact) + 1
  if (l <= 0 || i <= 0) return { value: 0, level: 'unknown' }
  const value = l * i
  return { value, level: levelFromValue(value) }
}
