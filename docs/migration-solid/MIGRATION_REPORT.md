# React → Solid Migration Report

> Branch: `migration/solid-risk-assessment`
> Baseline commit: `1df3fbd` (React 18 + Shadcn + react-hook-form)
> Migration completed at: 2026-05-13

## 1. Goals & scope

This was a **big-bang rewrite** of the existing frontend sample from React
18 to SolidJS, simultaneously bootstrapping a new **Risk Opportunity
Assessment** product surface (greenfield) on the Solid stack. Specifically:

- Migrate the entire application (`src/`) to SolidJS while preserving the
  Feature-Sliced Design layout (`app/`, `pages/`, `widgets/`, `features/`,
  `entities/`, `shared/`).
- Replace React-coupled libraries with Solid equivalents:
  - `@tanstack/react-router` → `@tanstack/solid-router`
  - `@tanstack/react-query` → `@tanstack/solid-query`
  - Radix UI + Shadcn → Kobalte + minimal native shims
  - `react-hook-form` → `@modular-forms/solid` (Zod 3 schema)
  - `sonner` → `solid-sonner`
  - `@sentry/react` → `@sentry/solid`
- Add new risk-assessment domain: 5×5 risk matrix entity, opportunity
  CRUD with mock seed, virtualised opportunity table, KPI cards, and
  reactive scoring preview.
- Re-instate testing (`@solidjs/testing-library`) and verify there is a
  measurable bundle-size win on cold load.

## 2. Phase summary

| Phase | Description | Status |
| ----- | ----------- | ------ |
| 0 | Capture React baseline (build stats, bundle sizes, screenshots) | ✅ |
| 1 | Toolchain swap: vite-plugin-solid, tanstack router plugin (target solid), tsconfig `jsxImportSource`, ESLint plugin-solid | ✅ |
| 2 | Shared layer: stores (Zustand → Solid signals/stores), hooks (useDebounce/useThrottle/useMediaQuery/useClipboard/usePagination), toasts, error boundary, monitoring | ✅ |
| 3 | Routing + providers: `src/main.tsx` (render), QueryProvider (Solid Query), EventRegistry, app providers, all `routes/*.tsx` to `lazyRouteComponent` | ✅ |
| 4 | UI kit: 22 Shadcn primitives ported (Kobalte-backed for Dialog/Sheet/Popover/Tooltip/Checkbox/RadioGroup/Select/Tabs/Accordion/Avatar/Separator; native for the rest); removed `Form`/`Toast` (replaced by `@modular-forms/solid` + `solid-sonner`); icons → `lucide-solid` | ✅ |
| 5 | Session provider: `createStore`-based, exposes `Accessor`s for `session`/`isLoading`/`error`; preserves Keycloak SSO flow | ✅ |
| 6 | Greenfield risk-assessment slices (`risk-matrix`, `risk-opportunity`, `risk-scoring`, `submit-assessment`, `filter-opportunities`, widgets/matrix-grid + opportunity-table, pages/risk-dashboard + risk-new, routes) | ✅ |
| 7 | Testing: `@testing-library/react` → `@solidjs/testing-library`; new tests for `scoring`, `useRiskScore`, refreshed `Button` test | ✅ |
| 8 | Build + benchmark vs baseline + this report | ✅ |

## 3. Bundle size: React vs Solid

Both builds use the same Vite config, manual chunking strategy, terser
config, and Tailwind setup. All numbers are from `vite build`'s reported
"computing gzip size" output for `dist/assets/`.

### Per-chunk comparison

| Chunk role | React (raw / gzip) | Solid (raw / gzip) | Δ raw | Δ gzip |
| --- | ---: | ---: | ---: | ---: |
| framework vendor | 141.28 / 45.42 (`react-vendor`) | 32.66 / 12.43 (`solid-vendor`) | **-108.62 KB** | **-33.0 KB** |
| tanstack vendor | 121.56 / 37.81 | 145.11 / 44.84 | +23.55 KB | +7.0 KB |
| UI vendor (Radix vs Kobalte) | 113.33 / 35.94 | 141.45 / 41.65 | +28.12 KB | +5.7 KB |
| form vendor (RHF+zod vs @modular-forms/solid+zod) | 82.92 / 24.94 | 66.67 / 16.33 | **-16.25 KB** | **-8.6 KB** |
| main app entry | 71.70 / 19.51 + 63.74 / 20.22 | 61.24 / 19.57 | **-74.20 KB** | **-20.2 KB** |
| button shim | 31.07 / 10.12 | 29.56 / 9.50 | -1.51 KB | -0.6 KB |
| keycloak | 29.79 / 8.95 | 29.79 / 8.95 | 0 | 0 |
| CSS | 38.39 / 7.64 | 36.29 / 7.39 | -2.10 KB | -0.25 KB |

The growth of `tanstack-vendor` and `ui-vendor` is expected: the Solid
build now also bundles `@tanstack/solid-virtual` (used by the
opportunity table) and the brand-new Kobalte surface area for the
dashboard. Net: even with two extra features included, the cold-load
budget shrinks.

### Totals

| Metric | React baseline | Solid (this PR) | Δ |
| --- | ---: | ---: | ---: |
| Total raw JS (`dist/assets/*.js`) | **~670 KB** | **~537 KB** | **-133 KB (-19.9%)** |
| Total gzip JS | **~205 KB** | **~167 KB** | **-38 KB (-18.5%)** |
| Initial-route gzip (entry + vendors + css) | **~172 KB** | **~142 KB** | **-30 KB (-17.4%)** |

### Why the win came in even with new features

- React + ReactDOM (45.4 KB gzip) is ~3.6× the size of Solid's runtime
  (12.4 KB gzip). That single substitution alone is the biggest lever.
- `@modular-forms/solid` is meaningfully smaller than `react-hook-form` +
  `@hookform/resolvers` while delivering the same field-array + Zod
  validation flow.
- The app no longer needs Radix's hidden runtime (`Slot`, layered
  presence/portal helpers) for primitives that Kobalte ships as compiled
  Solid components.
- `solid-sonner` replaces both the legacy `toast`/`toaster` Radix
  components and `sonner`.

## 4. Risk Opportunity Assessment surface (greenfield)

Three new routes/pages added on top of the migrated chassis:

- `GET /risk-dashboard` (`src/pages/risk-dashboard`):
  - KPI cards (total / severe / high / coverage by category).
  - 5×5 likelihood × impact matrix bucketing live data
    (`src/widgets/risk-matrix-grid`).
  - Filter widget (`src/features/filter-opportunities`) → drives the
    table query reactively via a single accessor.
  - Virtualised opportunity table powered by
    `@tanstack/solid-virtual` (`src/widgets/opportunity-table`) — only the
    visible rows render to DOM.
- `GET /risk/new` (`src/pages/risk-new`):
  - `src/features/submit-assessment` form built with
    `@modular-forms/solid` + Zod. Live "risk score preview" only
    re-renders the chip, not the whole form, thanks to
    `useRiskScore(likelihoodAccessor, impactAccessor)`.
  - `mitigations` is a `FieldArray` with add/remove rows.
- `GET /` (existing home) updated to deep-link to both surfaces.

Backing entity layer:

- `src/entities/risk-matrix/model/scoring.ts` — pure functions
  (`computeRiskScore`, `levelFromValue`) covered by unit tests.
- `src/entities/risk-opportunity` — types, mock seed (persisted to
  `localStorage` for the demo), Solid Query options, mutations.

## 5. Reactivity patterns adopted

To make the migration idiomatic and avoid the "React-flavoured Solid"
trap, the following patterns are applied consistently:

- **Hooks return accessors.** All shared/lib hooks (`useDebounce`,
  `useMediaQuery`, `useClipboard`, `usePermission`, etc.) expose
  `Accessor<T>` rather than raw values, so callers retain reactivity.
- **`createMemo` over derived constants.** E.g. the live risk-score
  preview is a single `createMemo` rather than recomputing in render.
- **`<Show>` / `<For>` instead of `&&` / `.map`.** Avoids re-walking
  entire trees and lets Solid track per-row identity.
- **`splitProps` on every primitive UI component.** Keeps remaining
  props reactive when forwarded to host elements (e.g. Kobalte triggers).
- **Stores via `createStore`** for session + modal state, replacing
  Zustand. Persistence (theme, feature flags) is done with
  `createEffect` + `localStorage`.
- **`lazyRouteComponent`** for all routes so route splitting still works
  with the new chunking config.

## 6. Test coverage status

```
$ npm test -- --run

 ✓ src/features/risk-scoring/model/use-risk-score.test.ts (3 tests)
 ✓ src/entities/risk-matrix/model/scoring.test.ts (10 tests)
 ✓ src/shared/ui/button.test.tsx (5 tests)

 Test Files  3 passed (3)
      Tests  18 passed (18)
```

- `scoring.test.ts` exercises the boundaries of `levelFromValue` (0,
  1, 4, 5, 9, 10, 15, 16, 25) and verifies the multiplication semantics
  of `computeRiskScore` (corner cases + a mid-grid value).
- `use-risk-score.test.ts` proves the memo only resolves when both
  inputs are present, and that it reacts on signal updates.
- `button.test.tsx` ported to `@solidjs/testing-library` (Kobalte + cva
  classes still verified).

Playwright (`test:e2e`) flows were not touched in this PR — they don't
depend on React internals and the new routes can be exercised in a
follow-up.

## 7. Migration risks & follow-ups

The big-bang nature of this rewrite means a few cleanup items remain:

1. **Tanstack vendor chunk grew by ~24 KB raw.** It now bundles
   `solid-router`, `solid-query`, `solid-query-devtools`, and
   `solid-virtual`. If we end up not using devtools in production
   builds, gating that import behind `import.meta.env.DEV` would claw
   back ~10 KB gzip.
2. **`size-limit` script not wired up.** The `size-limit` config in
   `package.json` exists but no CLI is installed; this report relies on
   the Vite build output. CI can pick it up after `npm i -D size-limit
   @size-limit/preset-app`.
3. **Server-rendered Sentry hooks.** `@sentry/solid` has different lifecycle
   integration vs `@sentry/react`. The current wiring is client-only and
   matches the existing setup, but if SSR is added later the integration
   list should be revisited.
4. **No design-system snapshot test.** Kobalte's portal-based components
   render to `<body>`, so test selectors should prefer accessible roles
   rather than container queries. This is reflected in the new
   `button.test.tsx`.

## 8. Reproducing the benchmark

```bash
git checkout 1df3fbd                 # React baseline
npm ci && npm run build
ls -la dist/assets/                  # baseline numbers

git checkout migration/solid-risk-assessment
rm -rf node_modules dist .vite
npm ci && npm run build
ls -la dist/assets/                  # Solid numbers
```

Baseline artifacts are checked in at
`docs/migration-solid/baseline/` (`react-bundle-stats.html`,
`react-bundle-sizes.txt`, `solid-bundle-stats.html`,
`solid-bundle-sizes.txt`).
