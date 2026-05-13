import { For } from 'solid-js'
import { riskLevelLabel, type RiskLevel } from '@/entities/risk-matrix/model/scoring'
import {
  opportunityCategoryLabel,
  type OpportunityCategory,
} from '@/entities/risk-opportunity/model/types'
import { Input } from '@/shared/ui/shadcn/input'

const CATEGORIES: OpportunityCategory[] = [
  'operational',
  'financial',
  'strategic',
  'compliance',
]

const LEVELS: RiskLevel[] = ['low', 'moderate', 'high', 'severe']

export interface RiskFilterValue {
  search: string
  category: OpportunityCategory | ''
  level: RiskLevel | ''
}

interface RiskFilterProps {
  value: RiskFilterValue
  onChange: (next: RiskFilterValue) => void
}

export function RiskFilter(props: RiskFilterProps) {
  return (
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div class="flex-1">
        <label
          for="risk-filter-search"
          class="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Tìm theo tiêu đề/mô tả
        </label>
        <Input
          id="risk-filter-search"
          placeholder="VD: APAC, KYC..."
          value={props.value.search}
          onInput={e => props.onChange({ ...props.value, search: e.currentTarget.value })}
        />
      </div>
      <div>
        <label
          for="risk-filter-category"
          class="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Danh mục
        </label>
        <select
          id="risk-filter-category"
          class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-44"
          value={props.value.category}
          onChange={e =>
            props.onChange({
              ...props.value,
              category: e.currentTarget.value as OpportunityCategory | '',
            })
          }
        >
          <option value="">Tất cả</option>
          <For each={CATEGORIES}>
            {c => <option value={c}>{opportunityCategoryLabel[c]}</option>}
          </For>
        </select>
      </div>
      <div>
        <label for="risk-filter-level" class="mb-1 block text-xs font-medium text-muted-foreground">
          Mức rủi ro
        </label>
        <select
          id="risk-filter-level"
          class="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-44"
          value={props.value.level}
          onChange={e =>
            props.onChange({
              ...props.value,
              level: e.currentTarget.value as RiskLevel | '',
            })
          }
        >
          <option value="">Tất cả</option>
          <For each={LEVELS}>{l => <option value={l}>{riskLevelLabel[l]}</option>}</For>
        </select>
      </div>
    </div>
  )
}
