# React Baseline Snapshot (Phase 0)

Captured on branch `migration/solid-risk-assessment` at commit `1df3fbd` before
any Solid migration code was committed.

## Bundle sizes (production build)

See [`react-bundle-sizes.txt`](./react-bundle-sizes.txt). Highlights from
`vite build` reporter:

| Chunk | Raw | Gzip |
| --- | ---: | ---: |
| `react-vendor` | 141.28 KB | 45.42 KB |
| `tanstack-vendor` | 121.56 KB | 37.81 KB |
| `ui-vendor` (Radix) | 113.33 KB | 35.94 KB |
| `form-vendor` (RHF + zod) | 82.92 KB | 24.94 KB |
| App `index-D6fJcv7q` | 71.70 KB | 19.51 KB |
| App `index-D0C6M9Na` | 63.74 KB | 20.22 KB |
| `button` (Radix Slot deps) | 31.07 KB | 10.12 KB |
| `keycloak` | 29.79 KB | 8.95 KB |
| CSS | 38.39 KB | 7.64 KB |
| **Total raw JS** | **~670 KB** | |
| **Total initial JS gzip** | | **~205 KB** |

Visual treemap: [`react-bundle-stats.html`](./react-bundle-stats.html) (open in browser).

## Configured budgets

`package.json` `size-limit` block — both branches:
- `dist/assets/index-*.js` — 200 KB gzip
- `dist/assets/index-*.css` — 50 KB gzip

## Goal for Phase 8

- Initial JS bundle: target ≤ 120 KB gzip (≈ 40% reduction).
- React framework chunk replaced by Solid (~30 KB raw / ~12 KB gzip).
- UI vendor replaced by Kobalte (~30 KB raw / ~9 KB gzip).
