import type { Impact, Likelihood, RiskLevel } from '@/entities/risk-matrix/model/scoring'

export type OpportunityCategory =
  | 'operational'
  | 'financial'
  | 'strategic'
  | 'compliance'

export const opportunityCategoryLabel: Record<OpportunityCategory, string> = {
  operational: 'Vận hành',
  financial: 'Tài chính',
  strategic: 'Chiến lược',
  compliance: 'Tuân thủ',
}

export interface OpportunityOwner {
  id: string
  name: string
  email: string
}

export interface Opportunity {
  id: string
  title: string
  description: string
  category: OpportunityCategory
  likelihood: Likelihood
  impact: Impact
  score: number
  level: RiskLevel
  mitigations: string[]
  owner: OpportunityOwner
  createdAt: string
  updatedAt: string
}

export interface CreateOpportunityInput {
  title: string
  description: string
  category: OpportunityCategory
  likelihood: Likelihood
  impact: Impact
  mitigations: string[]
  ownerId: string
}

export interface OpportunityListFilters {
  search?: string
  category?: OpportunityCategory
  level?: RiskLevel
}
