/**
 * In-memory opportunity seed.
 *
 * Mock data store backing the Risk Opportunity queries/mutations until a
 * real backend exists. Persisted to localStorage so demo state survives
 * reloads.
 */

import { computeRiskScore } from '@/entities/risk-matrix/model/scoring'
import type { Impact, Likelihood } from '@/entities/risk-matrix/model/scoring'
import type { Opportunity } from '../model/types'

const STORAGE_KEY = 'risk_opportunities'

function seed(): Opportunity[] {
  const baseOwner = { id: 'user-1', name: 'Lan Nguyễn', email: 'lan@example.com' }
  const altOwner = { id: 'user-2', name: 'Minh Trần', email: 'minh@example.com' }

  const make = (
    id: string,
    title: string,
    likelihood: Likelihood,
    impact: Impact,
    category: Opportunity['category']
  ): Opportunity => {
    const score = computeRiskScore(likelihood, impact)
    return {
      id,
      title,
      description: `Mô tả mẫu cho cơ hội ${title}.`,
      category,
      likelihood,
      impact,
      score: score.value,
      level: score.level,
      mitigations: ['Thiết lập kiểm soát', 'Theo dõi định kỳ'],
      owner: id.endsWith('-2') ? altOwner : baseOwner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  return [
    make('opp-1', 'Mở rộng thị trường APAC', 'likely', 'major', 'strategic'),
    make('opp-2', 'Tự động hoá quy trình KYC', 'possible', 'moderate', 'operational'),
    make('opp-3', 'Tăng giá gói premium', 'unlikely', 'severe', 'financial'),
    make('opp-4', 'Tuân thủ chuẩn ISO 27001', 'rare', 'minor', 'compliance'),
    make('opp-5', 'Ra mắt sản phẩm AI assist', 'almost-certain', 'severe', 'strategic'),
    make('opp-6', 'Đối tác phân phối mới', 'possible', 'major', 'strategic'),
    make('opp-7', 'Tối ưu chi phí cloud', 'likely', 'moderate', 'financial'),
  ]
}

function readStore(): Opportunity[] {
  if (typeof window === 'undefined') return seed()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = seed()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    return JSON.parse(raw) as Opportunity[]
  } catch {
    return seed()
  }
}

function writeStore(items: Opportunity[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* quota / private mode */
  }
}

export const opportunityStore = {
  list(): Opportunity[] {
    return readStore()
  },
  get(id: string): Opportunity | undefined {
    return readStore().find(op => op.id === id)
  },
  add(op: Opportunity) {
    const next = [op, ...readStore()]
    writeStore(next)
  },
  update(id: string, patch: Partial<Opportunity>) {
    const next = readStore().map(op =>
      op.id === id ? { ...op, ...patch, updatedAt: new Date().toISOString() } : op
    )
    writeStore(next)
  },
  remove(id: string) {
    writeStore(readStore().filter(op => op.id !== id))
  },
  reset() {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY)
  },
}
