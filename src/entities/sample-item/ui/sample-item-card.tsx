import { Badge } from '@/shared/ui/shadcn/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/card'
import type { SampleItem } from '../model/types'

interface SampleItemCardProps {
  item: SampleItem
}

export function SampleItemCard(props: SampleItemCardProps) {
  return (
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-base">{props.item.title}</CardTitle>
      </CardHeader>
      <CardContent class="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <Badge variant={props.item.status === 'active' ? 'default' : 'secondary'}>
          {props.item.status}
        </Badge>
        <span>Updated {new Date(props.item.updatedAt).toLocaleDateString()}</span>
      </CardContent>
    </Card>
  )
}
