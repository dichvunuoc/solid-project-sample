import { useQuery } from '@tanstack/solid-query'
import { For, Show } from 'solid-js'
import { RefreshSampleItemsButton } from '@/features/refresh-sample-items'
import { SampleItemCard, sampleItemsQueryOptions } from '@/entities/sample-item'
import { Skeleton } from '@/shared/ui/shadcn/skeleton'

export function SampleItemsPage() {
  const query = useQuery(() => sampleItemsQueryOptions)

  return (
    <div class="min-h-screen bg-background">
      <div class="container mx-auto max-w-3xl px-4 py-10">
        <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-foreground">Sample items</h1>
            <p class="mt-1 text-sm text-muted-foreground">
              Reference vertical slice: entity query → page composition → feature refresh.
            </p>
          </div>
          <RefreshSampleItemsButton />
        </div>

        <Show
          when={!query.isPending}
          fallback={
            <div class="space-y-3">
              <Skeleton class="h-24 w-full" />
              <Skeleton class="h-24 w-full" />
            </div>
          }
        >
          <Show
            when={!query.isError}
            fallback={
              <p class="text-sm text-destructive">
                {query.error instanceof Error ? query.error.message : 'Failed to load items'}
              </p>
            }
          >
            <Show
              when={(query.data?.items.length ?? 0) > 0}
              fallback={<p class="text-sm text-muted-foreground">No items yet.</p>}
            >
              <div class="space-y-3">
                <For each={query.data?.items}>{item => <SampleItemCard item={item} />}</For>
              </div>
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  )
}
