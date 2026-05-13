/**
 * Risk Opportunity — mutations.
 */

import { computeRiskScore } from '@/entities/risk-matrix/model/scoring'
import type { CreateOpportunityInput, Opportunity } from '../model/types'
import { opportunityStore } from './seed'

const OWNER_DIRECTORY: Record<string, Opportunity['owner']> = {
  'user-1': { id: 'user-1', name: 'Lan Nguyễn', email: 'lan@example.com' },
  'user-2': { id: 'user-2', name: 'Minh Trần', email: 'minh@example.com' },
  'user-3': { id: 'user-3', name: 'An Lê', email: 'an@example.com' },
}

function ownerFor(id: string): Opportunity['owner'] {
  return OWNER_DIRECTORY[id] ?? {
    id,
    name: 'Người dùng ẩn danh',
    email: `${id}@example.com`,
  }
}

export async function createOpportunity(
  input: CreateOpportunityInput
): Promise<Opportunity> {
  const id = `opp-${Date.now().toString(36)}`
  const score = computeRiskScore(input.likelihood, input.impact)
  const opportunity: Opportunity = {
    id,
    title: input.title,
    description: input.description,
    category: input.category,
    likelihood: input.likelihood,
    impact: input.impact,
    score: score.value,
    level: score.level,
    mitigations: input.mitigations.filter(Boolean),
    owner: ownerFor(input.ownerId),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  await new Promise(r => setTimeout(r, 250))
  opportunityStore.add(opportunity)
  return opportunity
}

export async function updateOpportunityRiskScore(
  id: string,
  likelihood: Opportunity['likelihood'],
  impact: Opportunity['impact']
): Promise<Opportunity | null> {
  const current = opportunityStore.get(id)
  if (!current) return null
  const score = computeRiskScore(likelihood, impact)
  opportunityStore.update(id, {
    likelihood,
    impact,
    score: score.value,
    level: score.level,
  })
  return opportunityStore.get(id) ?? null
}

export async function deleteOpportunity(id: string): Promise<void> {
  opportunityStore.remove(id)
}
