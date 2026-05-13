/**
 * Submit Assessment form (Solid + @modular-forms/solid).
 *
 * Mirrors the schema in `model/schema.ts`. Live risk score preview is
 * computed via `useRiskScore` based on the currently selected likelihood
 * and impact — the only DOM nodes that update on selection change are the
 * preview chip, not the entire form.
 */

import {
  createForm,
  getValue,
  insert,
  remove,
  zodForm,
} from '@modular-forms/solid'
import { useNavigate } from '@tanstack/solid-router'
import { For, Show, createMemo } from 'solid-js'
import {
  impactLabel,
  impactScale,
  likelihoodLabel,
  likelihoodScale,
  riskLevelLabel,
  riskLevelTone,
  type Impact,
  type Likelihood,
} from '@/entities/risk-matrix/model/scoring'
import { createOpportunity } from '@/entities/risk-opportunity/api/mutations'
import { opportunityCategoryLabel } from '@/entities/risk-opportunity/model/types'
import type { OpportunityCategory } from '@/entities/risk-opportunity/model/types'
import { useRiskScore } from '@/features/risk-scoring/model/use-risk-score'
import { cn } from '@/shared/lib/utils'
import { toast } from '@/shared/lib/toast'
import { Button } from '@/shared/ui/shadcn/button'
import { Select, TextField, Textarea } from '@/shared/ui/forms'
import type { AssessmentInput } from '../model/schema'
import { assessmentSchema } from '../model/schema'

const CATEGORY_OPTIONS = (
  ['operational', 'financial', 'strategic', 'compliance'] satisfies OpportunityCategory[]
).map(c => ({ value: c, label: opportunityCategoryLabel[c] }))

const LIKELIHOOD_OPTIONS = likelihoodScale.map(v => ({ value: v, label: likelihoodLabel[v] }))
const IMPACT_OPTIONS = impactScale.map(v => ({ value: v, label: impactLabel[v] }))

const OWNER_OPTIONS = [
  { value: 'user-1', label: 'Lan Nguyễn' },
  { value: 'user-2', label: 'Minh Trần' },
  { value: 'user-3', label: 'An Lê' },
]

export function AssessmentForm() {
  const navigate = useNavigate()
  const [form, { Form, Field, FieldArray }] = createForm<AssessmentInput>({
    validate: zodForm(assessmentSchema),
    initialValues: { mitigations: [''] },
  })

  const likelihood = createMemo(
    () => getValue(form, 'likelihood') as Likelihood | undefined
  )
  const impact = createMemo(() => getValue(form, 'impact') as Impact | undefined)
  const score = useRiskScore(likelihood, impact)

  return (
    <Form
      class="space-y-6"
      onSubmit={async values => {
        try {
          const created = await createOpportunity(values)
          toast.success('Đã ghi nhận đánh giá', `Mức rủi ro: ${riskLevelLabel[created.level]}`)
          void navigate({ to: '/risk-dashboard' })
        } catch (err) {
          toast.error(
            'Gửi đánh giá thất bại',
            err instanceof Error ? err.message : 'Vui lòng thử lại.'
          )
          throw err
        }
      }}
    >
      <Field name="title">
        {(field, props) => (
          <TextField
            {...props}
            id="title"
            label="Tiêu đề cơ hội"
            value={field.value ?? ''}
            error={field.error}
            placeholder="VD: Mở rộng thị trường APAC"
            required
          />
        )}
      </Field>
      <Field name="description">
        {(field, props) => (
          <Textarea
            {...props}
            id="description"
            label="Mô tả chi tiết"
            value={field.value ?? ''}
            error={field.error}
            placeholder="Mô tả bối cảnh, mục tiêu, và các giả định chính."
            rows={4}
            required
          />
        )}
      </Field>
      <Field name="category">
        {(field, props) => (
          <Select
            {...props}
            id="category"
            label="Danh mục"
            value={field.value ?? ''}
            error={field.error}
            options={CATEGORY_OPTIONS}
            placeholder="Chọn danh mục"
            required
          />
        )}
      </Field>

      <div class="grid gap-4 sm:grid-cols-2">
        <Field name="likelihood">
          {(field, props) => (
            <Select
              {...props}
              id="likelihood"
              label="Khả năng xảy ra"
              value={field.value ?? ''}
              error={field.error}
              options={LIKELIHOOD_OPTIONS}
              placeholder="Chọn mức độ"
              required
            />
          )}
        </Field>
        <Field name="impact">
          {(field, props) => (
            <Select
              {...props}
              id="impact"
              label="Mức độ tác động"
              value={field.value ?? ''}
              error={field.error}
              options={IMPACT_OPTIONS}
              placeholder="Chọn mức độ"
              required
            />
          )}
        </Field>
      </div>

      <Show when={score().level !== 'unknown'}>
        <div
          class={cn(
            'rounded-md p-3 text-sm flex items-center justify-between gap-3',
            riskLevelTone[score().level]
          )}
          aria-live="polite"
        >
          <span>
            Điểm rủi ro: <b>{score().value}</b>
          </span>
          <span>
            Mức: <b>{riskLevelLabel[score().level]}</b>
          </span>
        </div>
      </Show>

      <Field name="ownerId">
        {(field, props) => (
          <Select
            {...props}
            id="ownerId"
            label="Chủ sở hữu"
            value={field.value ?? ''}
            error={field.error}
            options={OWNER_OPTIONS}
            placeholder="Chọn người chịu trách nhiệm"
            required
          />
        )}
      </Field>

      <fieldset class="space-y-3">
        <legend class="text-sm font-medium">Biện pháp giảm thiểu</legend>
        <FieldArray name="mitigations">
          {fieldArray => (
            <div class="space-y-2">
              <For each={fieldArray.items}>
                {(_, index) => (
                  <div class="flex items-end gap-2">
                    <Field name={`mitigations.${index()}`}>
                      {(field, props) => (
                        <TextField
                          {...props}
                          id={`mitigation-${index()}`}
                          value={field.value ?? ''}
                          error={field.error}
                          placeholder={`Biện pháp #${index() + 1}`}
                          class="flex-1"
                        />
                      )}
                    </Field>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => remove(form, 'mitigations', { at: index() })}
                      disabled={fieldArray.items.length <= 1}
                    >
                      Xoá
                    </Button>
                  </div>
                )}
              </For>
              <Button
                type="button"
                variant="secondary"
                onClick={() => insert(form, 'mitigations', { value: '' })}
              >
                + Thêm biện pháp
              </Button>
            </div>
          )}
        </FieldArray>
      </fieldset>

      <div class="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => void navigate({ to: '/risk-dashboard' })}
        >
          Huỷ
        </Button>
        <Button type="submit" disabled={form.submitting}>
          {form.submitting ? 'Đang gửi...' : 'Lưu đánh giá'}
        </Button>
      </div>
    </Form>
  )
}
