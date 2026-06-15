import { Show, type JSX } from 'solid-js'
import { cn } from '@/shared/lib/utils'

export interface PageHeaderProps {
  title: string
  description?: string
  /** Optional actions rendered on the trailing edge (buttons, menus, etc.). */
  actions?: JSX.Element
  class?: string
}

/**
 * Example widget — a composable page header.
 *
 * Widgets are self-contained UI blocks assembled into pages. Per FSD they may
 * import from `shared`, `entities`, and `features`, but never from `pages` or
 * `app`. This one only needs `shared`; a richer widget might compose an entity
 * card with a feature action (e.g. a user menu).
 */
export function PageHeader(props: PageHeaderProps) {
  return (
    <header class={cn('flex flex-wrap items-start justify-between gap-4 pb-6', props.class)}>
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold text-foreground">{props.title}</h1>
        <Show when={props.description}>
          <p class="text-sm text-muted-foreground">{props.description}</p>
        </Show>
      </div>
      <Show when={props.actions}>
        <div class="flex items-center gap-2">{props.actions}</div>
      </Show>
    </header>
  )
}
