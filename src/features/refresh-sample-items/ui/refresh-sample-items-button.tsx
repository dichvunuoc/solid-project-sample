import { Button } from '@/shared/ui/shadcn/button'
import { useRefreshSampleItems } from '../model/use-refresh-sample-items'

export function RefreshSampleItemsButton() {
  const { refresh } = useRefreshSampleItems()

  return (
    <Button variant="outline" size="sm" onClick={() => refresh()}>
      Refresh list
    </Button>
  )
}
