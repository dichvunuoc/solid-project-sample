import { z } from 'zod'
import { impactScale, likelihoodScale } from '@/entities/risk-matrix/model/scoring'

const requiredEnumError = (label: string) => ({
  errorMap: () => ({ message: label }),
})

export const assessmentSchema = z.object({
  title: z
    .string()
    .min(3, 'Tiêu đề tối thiểu 3 ký tự')
    .max(120, 'Tiêu đề tối đa 120 ký tự'),
  description: z
    .string()
    .min(10, 'Mô tả tối thiểu 10 ký tự')
    .max(2000, 'Mô tả tối đa 2000 ký tự'),
  category: z.enum(
    ['operational', 'financial', 'strategic', 'compliance'],
    requiredEnumError('Chọn danh mục')
  ),
  likelihood: z.enum(likelihoodScale, requiredEnumError('Chọn khả năng xảy ra')),
  impact: z.enum(impactScale, requiredEnumError('Chọn mức độ tác động')),
  mitigations: z
    .array(z.string().min(3, 'Mỗi biện pháp tối thiểu 3 ký tự'))
    .min(1, 'Cần ít nhất 1 biện pháp giảm thiểu'),
  ownerId: z
    .string()
    .min(1, 'Chọn chủ sở hữu')
    .max(64, 'Owner ID quá dài'),
})

export type AssessmentInput = z.infer<typeof assessmentSchema>
