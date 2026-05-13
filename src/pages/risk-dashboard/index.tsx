/**
 * Risk Dashboard page.
 *
 * Composes the KPI cards, 5×5 matrix, filter, and virtualized table.
 * Filters propagate to the table query reactively via `createSignal`.
 */

import { Link, useNavigate } from '@tanstack/solid-router'
import { Show, createSignal } from 'solid-js'
import { RiskKpiCards } from '@/entities/risk-opportunity'
import { useSessionContext } from '@/entities/session/ui/session-provider'
import { RiskFilter, type RiskFilterValue } from '@/features/filter-opportunities'
import { OpportunityTable } from '@/widgets/opportunity-table'
import { RiskMatrixGrid } from '@/widgets/risk-matrix-grid'
import { Spinner } from '@/shared/ui/spinner'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'

export function RiskDashboardPage() {
  const session = useSessionContext()
  const navigate = useNavigate()
  const [filters, setFilters] = createSignal<RiskFilterValue>({
    search: '',
    category: '',
    level: '',
  })

  const queryFilters = () => {
    const f = filters()
    return {
      ...(f.search ? { search: f.search } : {}),
      ...(f.category ? { category: f.category } : {}),
      ...(f.level ? { level: f.level } : {}),
    }
  }

  return (
    <Show
      when={!session.isLoading()}
      fallback={
        <div class="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <div class="min-h-screen bg-background">
        <div class="container mx-auto px-4 py-10 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 class="text-3xl font-bold">Risk Opportunity Dashboard</h1>
              <p class="text-sm text-muted-foreground">
                Theo dõi cơ hội rủi ro theo ma trận 5×5 và bảng tổng hợp.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Button variant="outline" onClick={() => void navigate({ to: '/dashboard' })}>
                Legacy Dashboard
              </Button>
              <Link
                to="/risk/new"
                class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                + Đánh giá cơ hội mới
              </Link>
            </div>
          </div>

          <RiskKpiCards />

          <div class="grid gap-6 lg:grid-cols-3">
            <Card class="lg:col-span-2">
              <CardHeader>
                <CardTitle>Ma trận rủi ro 5 × 5</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskMatrixGrid />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bộ lọc</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskFilter value={filters()} onChange={setFilters} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách cơ hội</CardTitle>
            </CardHeader>
            <CardContent>
              <OpportunityTable filters={queryFilters()} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Show>
  )
}
