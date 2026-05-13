import { Link } from '@tanstack/solid-router'
import { AssessmentForm } from '@/features/submit-assessment'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui'

export function RiskNewPage() {
  return (
    <div class="min-h-screen bg-background">
      <div class="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div>
          <Link
            to="/risk-dashboard"
            class="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Quay lại Risk Dashboard
          </Link>
          <h1 class="mt-2 text-3xl font-bold">Đánh giá cơ hội mới</h1>
          <p class="text-sm text-muted-foreground">
            Điền thông tin cơ hội, ma trận rủi ro sẽ cập nhật trực tiếp khi bạn
            chọn khả năng xảy ra và mức độ tác động.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin đánh giá</CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
