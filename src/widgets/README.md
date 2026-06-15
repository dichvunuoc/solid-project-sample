# Widgets layer

Self-contained, reusable UI blocks that compose `entities` and `features` into
larger pieces a page can drop in (headers, sidebars, data tables with toolbars,
dashboards).

## FSD rules

A widget **may** import from: `shared`, `entities`, `features`.
A widget **must not** import from: `pages`, `app`, or other widgets.
These boundaries are enforced by ESLint (`eslint-plugin-boundaries`).

## Structure

```
src/widgets/<widget-name>/
├── ui/            # components
├── model/         # local state/logic (optional)
└── index.ts       # public API (import widgets only via this barrel)
```

## Example

[`page-header/`](./page-header) is a minimal reference widget. Use it from a page:

```tsx
import { PageHeader } from '@/widgets/page-header'

;<PageHeader title="Sample items" description="Your protected slice" actions={<RefreshButton />} />
```

Delete the example once you have real widgets.
