# Architecture Rules

**Version:** 1.0.0  
**Last Updated:** 2025-01-31  
**Status:** IMMUTABLE - Source of Truth for AI Agents

---

## Table of Contents

1. [FSD Layering Strategy](#fsd-layering-strategy)
2. [Routing & SSR](#routing--ssr)
3. [Tech Stack](#tech-stack)
4. [Naming Conventions](#naming-conventions)
5. [Standard Data Flow](#standard-data-flow)

---

## FSD Layering Strategy

This project follows **Feature-Sliced Design (FSD)** architecture with strict layer isolation and dependency rules.

### Layer Structure

```
src/
├── app/          # Application initialization layer
├── pages/        # Page composition layer
├── features/     # Business features layer
├── entities/     # Business entities layer
└── shared/       # Shared infrastructure layer
```

### Layer Rules

#### 1. **app/** - Application Layer

- **Purpose**: Application initialization, root providers, global configuration
- **Contains**:
  - `root.tsx` - Root component with providers
  - `providers.tsx` - Provider composition (Query, Session, Event Registry, etc.)
  - `app.css` - Global styles
  - `types.ts` - Global TypeScript types
- **Dependencies**: Can import from `shared` only
- **Exports**: Root component, providers

**Example Structure:**

```
src/app/
├── root.tsx
├── providers.tsx
├── providers/
│   ├── query-provider.tsx
│   └── event-registry.tsx
├── app.css
└── types.ts
```

#### 2. **pages/** - Page Composition Layer

- **Purpose**: Page-level components that compose features and entities
- **Contains**: One component per route/page
- **Dependencies**: Can import from `features`, `entities`, `shared`
- **Rules**:
  - Pages are **composition-only** - no business logic
  - Pages orchestrate features and entities
  - Each page corresponds to a route in `src/routes/`

**Example Structure:**

```
src/pages/
├── home/
│   └── index.tsx
├── dashboard/
│   └── index.tsx
└── auth/
    ├── login/
    │   └── index.tsx
    └── register/
        └── index.tsx
```

**Example Page:**

```typescript
// src/pages/dashboard/index.tsx
import { useDashboardSync } from '@/features/dashboard-sync'
import { ProcessPaymentAction } from '@/features/process-payment'
import { FinanceCard } from '@/entities/finance'

export function DashboardPage() {
  useDashboardSync() // Feature orchestrator
  return (
    <div>
      <FinanceCard /> {/* Entity UI */}
      <ProcessPaymentAction /> {/* Feature UI */}
    </div>
  )
}
```

#### 3. **features/** - Business Features Layer

- **Purpose**: Self-contained business features with UI and business logic
- **Structure**: Each feature is a slice with:
  - `index.ts` - Public API exports
  - `ui/` - Feature UI components
  - `model/` - Business logic hooks/models
  - `api/` - Feature-specific API calls (optional)
- **Dependencies**: Can import from `entities` and `shared` only
- **Rules**:
  - Features are **horizontally isolated** - cannot import other features
  - Features communicate via **Event Bus** (shared layer)
  - Feature UI components trigger actions, not business logic
  - Business logic lives in `model/` hooks

**Example Structure:**

```
src/features/
├── process-payment/
│   ├── index.ts
│   ├── ui/
│   │   └── ProcessPaymentAction.tsx
│   └── model/
│       └── use-process-payment.ts
├── process-rewards/
│   ├── index.ts
│   └── api/
│       └── use-reward-chain.ts
└── auth/
    ├── sign-in/
    │   └── ui/
    │       └── sign-in-form.tsx
    └── sign-up/
        ├── index.ts
        └── ui/
            └── sign-up-form.tsx
```

**Example Feature Model:**

```typescript
// src/features/process-payment/model/use-process-payment.ts
import { eventRegistry, PaymentSuccessEvent } from '@/shared/api/events'

export function useProcessPayment() {
  const processPayment = async (params: ProcessPaymentParams) => {
    // Business logic here
    const event = new PaymentSuccessEvent({ ... })
    eventRegistry.emit(event.eventName, event)
  }
  return { processPayment, isProcessing }
}
```

#### 4. **entities/** - Business Entities Layer

- **Purpose**: Business entities with data models, API queries, and presentational UI
- **Structure**: Each entity is a slice with:
  - `index.ts` - Public API exports
  - `model/` - Entity types/interfaces
  - `api/` - Data fetching (TanStack Query queryOptions)
  - `ui/` - Presentational components (no business logic)
- **Dependencies**: Can import from `shared` only
- **Rules**:
  - Entities are **horizontally isolated** - cannot import other entities
  - Entity UI components are **presentational only**
  - Data fetching uses TanStack Query `queryOptions`
  - Entity types define the domain model

**Example Structure:**

```
src/entities/
├── finance/
│   ├── index.ts
│   ├── model/
│   │   └── types.ts
│   ├── api/
│   │   └── queries.ts
│   └── ui/
│       └── FinanceCard.tsx
├── post/
│   ├── index.ts
│   ├── api/
│   │   └── like-post.ts
│   └── ui/
│       └── like-button.tsx
└── session/
    ├── index.ts
    ├── api/
    │   └── use-session.ts
    └── ui/
        └── session-provider.tsx
```

**Example Entity Query:**

```typescript
// src/entities/finance/api/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-keys'

export const dashboardStatsQueryOptions = queryOptions({
  queryKey: queryKeys.finance.all(),
  queryFn: fetchDashboardStats,
})
```

#### 5. **shared/** - Shared Infrastructure Layer

- **Purpose**: Reusable utilities, UI components, API clients, and infrastructure
- **Structure**:
  - `api/` - HTTP client, query keys, event registry, mocks
  - `lib/` - Utilities, hooks, stores, validation, events
  - `ui/` - Shared UI components (shadcn/ui, forms, etc.)
  - `config/` - Configuration (env, etc.)
- **Dependencies**: Cannot import from any other layer
- **Rules**:
  - Shared code has **no business logic**
  - All shared code is **framework-agnostic** where possible
  - UI components are **pure presentational**

**Example Structure:**

```
src/shared/
├── api/
│   ├── http-client.ts
│   ├── query-keys.ts
│   ├── better-auth.ts
│   ├── events/
│   │   ├── index.ts
│   │   └── README.md
│   └── mocks/
├── lib/
│   ├── events/
│   │   ├── bus.ts
│   │   ├── registry.ts
│   │   └── events/
│   ├── stores/
│   │   ├── use-theme-store.ts
│   │   └── use-modal-store.ts
│   ├── validation/
│   │   ├── schemas.ts
│   │   └── index.ts
│   └── hooks/
└── ui/
    ├── button.tsx
    ├── card.tsx
    └── forms/
```

### Dependency Rules (CRITICAL)

**Layer Dependency Flow (Top to Bottom):**

```
app → pages → features → entities → shared
```

**Allowed Imports:**

- `app` can import: `shared` only
- `pages` can import: `features`, `entities`, `shared`
- `features` can import: `entities`, `shared`
- `entities` can import: `shared` only
- `shared` can import: nothing (external libraries only)

**FORBIDDEN:**

- ❌ Features importing other features
- ❌ Entities importing other entities
- ❌ Lower layers importing higher layers
- ❌ Circular dependencies

### Path Aliases

Configured in `vite.config.ts` and `tsconfig.json`:

```typescript
{
  "@": "./src",
  "@/app": "./src/app",
  "@/pages": "./src/pages",
  "@/widgets": "./src/widgets", // Reserved for future use
  "@/features": "./src/features",
  "@/entities": "./src/entities",
  "@/shared": "./src/shared"
}
```

**Usage:**

```typescript
import { httpClient } from '@/shared/api/http-client'
import { FinanceCard } from '@/entities/finance'
import { useProcessPayment } from '@/features/process-payment'
```

---

## Routing & SSR

This project uses **TanStack Router** (formerly TanStack Start) for file-based routing with SSR support.

### Route Structure

Routes are defined in `src/routes/` directory using file-based routing:

```
src/routes/
├── __root.tsx          # Root route (layout)
├── index.tsx          # Home page (/)
├── dashboard.tsx      # Dashboard page (/dashboard)
├── login.tsx          # Login page (/login)
├── register.tsx       # Register page (/register)
└── api/               # API routes (SSR)
    └── auth/
        └── $.ts       # Catch-all API route (/api/auth/*)
```

### Route File Pattern

Each route file exports a `Route` object created with `createFileRoute()`:

```typescript
// src/routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { authGuard } from '@/shared/lib/route-guards'

const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then(module => ({
    default: module.DashboardPage,
  }))
)

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  beforeLoad: async () => {
    await authGuard() // Route protection
  },
})
```

### Root Route

The root route (`__root.tsx`) provides the application layout:

```typescript
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return <Outlet /> // Renders child routes
}
```

### API Routes (SSR)

API routes are defined in `src/routes/api/` and use standard HTTP methods:

```typescript
// src/routes/api/auth/$.ts
import { betterAuth } from '@/shared/api/better-auth'

export async function GET() {
  return betterAuth.handler()
}

export async function POST() {
  return betterAuth.handler()
}
```

**API Route Rules:**

- API routes use file-based routing under `src/routes/api/`
- Export async functions: `GET()`, `POST()`, `PUT()`, `DELETE()`, `PATCH()`
- Return `Response` objects
- Can use server-side logic (database, auth, etc.)

### Route Guards

Route protection is handled via `beforeLoad`:

```typescript
export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  beforeLoad: async () => {
    await authGuard() // Redirects to /login if not authenticated
  },
})
```

**Available Guards:**

- `authGuard()` - Requires authentication
- Custom guards can be created in `@/shared/lib/route-guards`

### Route Generation

TanStack Router automatically generates route tree:

- **Generated File**: `src/routeTree.gen.ts` (auto-generated, do not edit)
- **Plugin**: `@tanstack/router-vite-plugin` in `vite.config.ts`
- **Routes Directory**: `./src/routes` (configured in plugin)

### Lazy Loading

Routes use React `lazy()` for code splitting:

```typescript
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then(module => ({
    default: module.DashboardPage,
  }))
)
```

### Router Configuration

Router is initialized in `src/app.tsx`:

```typescript
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
```

---

## Tech Stack

### Core Framework

- **React**: 18.3.1
- **TypeScript**: 5.5.3
- **Vite**: 5.4.11 (Build tool)
- **TanStack Router**: 1.144.0 (Routing & SSR)

### State Management

#### 1. **TanStack Query** (Server State)

- **Version**: 5.90.14
- **Purpose**: Server state, data fetching, caching
- **Usage**:
  - Entity API queries (`src/entities/*/api/queries.ts`)
  - Feature API calls
  - Automatic caching, refetching, invalidation

**Example:**

```typescript
import { useQuery } from '@tanstack/react-query'
import { dashboardStatsQueryOptions } from '@/entities/finance/api/queries'

export function FinanceCard() {
  const { data, isLoading } = useQuery(dashboardStatsQueryOptions)
  // ...
}
```

#### 2. **Zustand** (Client State)

- **Version**: 4.5.0
- **Purpose**: Global client-side state (theme, modals, UI preferences)
- **Usage**:
  - `src/shared/lib/stores/use-theme-store.ts`
  - `src/shared/lib/stores/use-modal-store.ts`
- **Persistence**: Uses `zustand/middleware/persist` for localStorage

**Example:**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      theme: 'system',
      setTheme: theme => set({ theme }),
    }),
    { name: 'theme-storage' }
  )
)
```

#### 3. **Event Bus** (Cross-Feature Communication)

- **Library**: `mitt` (3.0.1)
- **Purpose**: Type-safe event communication between features
- **Location**: `src/shared/lib/events/bus.ts`
- **Usage**: Features emit/listen to events without direct dependencies

**Example:**

```typescript
import { eventBus } from '@/shared/lib/events/bus'
import { PaymentSuccessEvent, PAYMENT_SUCCESS } from '@/shared/lib/events/registry'

// Emit event
const event = new PaymentSuccessEvent({ orderId, amount })
eventBus.emit(event.eventName, event)

// Listen to event
eventBus.on(PAYMENT_SUCCESS, (event: PaymentSuccessEvent) => {
  // Handle event
})
```

#### 4. **Local State** (Component State)

- **Library**: React `useState`, `useReducer`
- **Purpose**: Component-specific state
- **Usage**: UI components, form state

### Validation

#### **Zod** (Schema Validation)

- **Version**: 4.3.2
- **Purpose**: Runtime type validation, form validation
- **Location**: `src/shared/lib/validation/schemas.ts`
- **Integration**: React Hook Form via `@hookform/resolvers`

**Example:**

```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const form = useForm({
  resolver: zodResolver(schema),
})
```

**Common Schemas:**

- `emailSchema` - Email validation
- `passwordSchema(minLength)` - Password with complexity
- `nameSchema(minLength)` - Name validation
- `phoneSchema` - Phone number validation
- Located in `src/shared/lib/validation/schemas.ts`

### Data Fetching

#### **TanStack Query** (Primary)

- **Query Options Pattern**: Use `queryOptions()` for reusable queries
- **Query Keys**: Centralized in `src/shared/api/query-keys.ts`
- **HTTP Client**: `src/shared/api/http-client.ts`

**Query Options Pattern:**

```typescript
// src/entities/finance/api/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-keys'

export const dashboardStatsQueryOptions = queryOptions({
  queryKey: queryKeys.finance.all(),
  queryFn: fetchDashboardStats,
  staleTime: 0,
})
```

**Query Keys Factory:**

```typescript
// src/shared/api/query-keys.ts
export const queryKeys = {
  finance: {
    all: () => ['dashboard-stats'] as const,
    user: (userId: string) => ['finance', 'user', userId] as const,
  },
} as const
```

#### **HTTP Client**

- **Location**: `src/shared/api/http-client.ts`
- **Features**:
  - Automatic auth token injection
  - Error handling with toast notifications
  - Request timeout
  - Type-safe responses

**Example:**

```typescript
import { httpClient } from '@/shared/api/http-client'

const data = await httpClient.post<ResponseType>('/api/endpoint', payload)
```

### UI Components

#### **Radix UI** (Headless Components)

- **Version**: Various (see package.json)
- **Purpose**: Accessible, unstyled UI primitives
- **Components**: Dialog, Dropdown, Select, Toast, etc.

#### **shadcn/ui** (Styled Components)

- **Location**: `src/shared/ui/shadcn/`
- **Purpose**: Pre-styled Radix UI components
- **Styling**: Tailwind CSS

#### **Tailwind CSS** (Styling)

- **Version**: 3.4.4
- **Purpose**: Utility-first CSS framework
- **Config**: `tailwind.config.ts`

### Forms

#### **React Hook Form** (Form Management)

- **Version**: 7.69.0
- **Integration**: `@hookform/resolvers` (5.2.2) with Zod
- **Location**: `src/shared/ui/forms/`

**Example:**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
})
```

### Authentication

#### **Better Auth** (Auth Framework)

- **Version**: 1.4.9
- **Status**: Currently using mock auth (see `src/shared/lib/mock-auth.ts`)
- **Location**: `src/shared/api/better-auth.ts`
- **Client**: `src/shared/lib/client-auth.ts`

**Note**: Real Better Auth is configured but commented out. Mock auth is active.

### Testing

#### **Vitest** (Unit Testing)

- **Version**: 1.0.4
- **Config**: `vitest.config.ts`

#### **Playwright** (E2E Testing)

- **Version**: 1.57.0
- **Config**: `playwright.config.ts`
- **Location**: `e2e/`

#### **Testing Library** (React Testing)

- **Versions**:
  - `@testing-library/react`: 14.1.2
  - `@testing-library/jest-dom`: 6.1.5
  - `@testing-library/user-event`: 14.5.1

### Development Tools

- **ESLint**: 8.57.0 (Linting)
- **Prettier**: 3.3.3 (Formatting)
- **Husky**: 9.0.11 (Git hooks)
- **lint-staged**: 15.2.2 (Pre-commit linting)

---

## Naming Conventions

### Files

#### **kebab-case** (Default)

- All files use kebab-case: `use-reward-chain.ts`, `sign-in-form.tsx`
- **Applies to**:
  - Feature/entity slices
  - API files
  - Model files
  - Utility files
  - Config files

**Examples:**

```
src/features/process-payment/ui/ProcessPaymentAction.tsx
src/entities/finance/api/queries.ts
src/shared/lib/use-media-query.ts
```

#### **PascalCase** (Components Only)

- React component files use PascalCase: `FinanceCard.tsx`, `ProcessPaymentAction.tsx`
- **Applies to**:
  - UI component files (`.tsx`)
  - One component per file

**Examples:**

```
src/entities/finance/ui/FinanceCard.tsx
src/features/process-payment/ui/ProcessPaymentAction.tsx
src/shared/ui/button.tsx (exception: shared UI uses kebab-case)
```

### Components

#### **PascalCase** (Component Names)

- All React components use PascalCase
- Component name must match file name (if single export)

**Examples:**

```typescript
// FinanceCard.tsx
export function FinanceCard() { ... }

// ProcessPaymentAction.tsx
export function ProcessPaymentAction() { ... }
```

### Functions & Hooks

#### **camelCase** (Functions/Hooks)

- Functions and hooks use camelCase
- Hooks must start with `use`: `useProcessPayment`, `useRewardChain`

**Examples:**

```typescript
export function useProcessPayment() { ... }
export function useRewardChain() { ... }
export function fetchDashboardStats() { ... }
```

### Constants

#### **UPPER_SNAKE_CASE** (Constants)

- Constants use UPPER_SNAKE_CASE
- Event keys, query keys, config values

**Examples:**

```typescript
export const POST_LIKED = 'post:liked'
export const PAYMENT_SUCCESS = 'payment:success'
export const API_BASE_URL = 'https://api.example.com'
```

### Types & Interfaces

#### **PascalCase** (Types/Interfaces)

- TypeScript types and interfaces use PascalCase
- Generic types use single uppercase letter: `T`, `K`, `V`

**Examples:**

```typescript
interface ProcessPaymentParams { ... }
type DashboardStats = { ... }
type QueryOptions<T> = { ... }
```

### Directories

#### **kebab-case** (Directories)

- All directories use kebab-case
- Matches FSD slice naming

**Examples:**

```
src/features/process-payment/
src/entities/finance/
src/shared/lib/events/
```

### Route Files

#### **Special Naming** (Routes)

- Route files follow TanStack Router conventions:
  - `__root.tsx` - Root route
  - `index.tsx` - Index route (/)
  - `$.ts` - Catch-all route
  - `[param].tsx` - Dynamic route (if used)

**Examples:**

```
src/routes/__root.tsx
src/routes/index.tsx
src/routes/dashboard.tsx
src/routes/api/auth/$.ts
```

### Index Files

#### **index.ts** (Public API)

- Each slice exports public API via `index.ts`
- Re-exports only public components/hooks

**Example:**

```typescript
// src/features/process-payment/index.ts
export { ProcessPaymentAction } from './ui/ProcessPaymentAction'
export { useProcessPayment } from './model/use-process-payment'
```

---

## Standard Data Flow

This section defines the **architectural path** for data flow through the application layers.

### Flow Diagram

```
User Action
    ↓
Page Component (pages/)
    ↓
Feature UI (features/*/ui/)
    ↓
Feature Model (features/*/model/)
    ↓
Entity API/Store (entities/*/api/ or shared/lib/stores/)
    ↓
HTTP Client (shared/api/http-client.ts)
    ↓
Server Function (routes/api/ or external API)
    ↓
Event Bus (shared/lib/events/bus.ts) [Optional]
    ↓
Query Invalidation (TanStack Query)
    ↓
UI Update (Automatic via React Query)
```

### Detailed Flow Patterns

#### Pattern 1: Feature with Entity Data (Read)

**Flow:**

1. **Page** renders Entity UI component
2. **Entity UI** uses TanStack Query hook
3. **Entity API** provides `queryOptions`
4. **HTTP Client** fetches from server
5. **UI** updates automatically when data arrives

**Example: Dashboard Stats**

```typescript
// 1. Page composes Entity
// src/pages/dashboard/index.tsx
export function DashboardPage() {
  return <FinanceCard /> // Entity UI
}

// 2. Entity UI uses Query
// src/entities/finance/ui/FinanceCard.tsx
export function FinanceCard() {
  const { data } = useQuery(dashboardStatsQueryOptions) // Entity API
  return <div>{data.totalRevenue}</div>
}

// 3. Entity API defines Query
// src/entities/finance/api/queries.ts
export const dashboardStatsQueryOptions = queryOptions({
  queryKey: queryKeys.finance.all(),
  queryFn: fetchDashboardStats, // Uses httpClient internally
})

// 4. HTTP Client fetches
// src/shared/api/http-client.ts
httpClient.get('/api/dashboard/stats')
```

#### Pattern 2: Feature Action with Event Emission (Write)

**Flow:**

1. **Page** renders Feature UI component
2. **Feature UI** calls Feature Model hook
3. **Feature Model** performs action (API call, mutation)
4. **Feature Model** emits event to Event Bus
5. **Other Features** listen to events and react
6. **Query Invalidation** triggers refetch

**Example: Process Payment**

```typescript
// 1. Page composes Feature
// src/pages/dashboard/index.tsx
export function DashboardPage() {
  return <ProcessPaymentAction /> // Feature UI
}

// 2. Feature UI triggers action
// src/features/process-payment/ui/ProcessPaymentAction.tsx
export function ProcessPaymentAction() {
  const { processPayment } = useProcessPayment() // Feature Model
  return <button onClick={() => processPayment({ ... })}>Pay</button>
}

// 3. Feature Model performs action and emits event
// src/features/process-payment/model/use-process-payment.ts
export function useProcessPayment() {
  const processPayment = async (params) => {
    await httpClient.post('/api/payments', params)
    const event = new PaymentSuccessEvent({ ... })
    eventBus.emit(event.eventName, event) // Emit event
  }
  return { processPayment }
}

// 4. Another Feature listens and invalidates
// src/features/dashboard-sync/model/use-dashboard-sync.ts
export function useDashboardSync() {
  useEffect(() => {
    const handler = (event: PaymentSuccessEvent) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all() })
    }
    eventBus.on(PAYMENT_SUCCESS, handler)
    return () => eventBus.off(PAYMENT_SUCCESS, handler)
  }, [])
}

// 5. Entity UI automatically refetches
// FinanceCard's useQuery automatically refetches when invalidated
```

#### Pattern 3: Feature Chain (Event-Driven)

**Flow:**

1. **Feature A** emits event
2. **Feature B** listens to event and performs action
3. **Feature B** emits another event
4. **Feature C** listens and updates UI

**Example: Post Like → Reward Processing**

```typescript
// 1. Entity emits event
// src/entities/post/api/like-post.ts
eventBus.emit(POST_LIKED, new PostLikedEvent({ postId, userId }))

// 2. Feature listens and processes
// src/features/process-rewards/api/use-reward-chain.ts
export function useRewardChain() {
  useEffect(() => {
    const handler = (event: PostLikedEvent) => {
      processReward({ userId: event.userId, postId: event.postId })
    }
    eventBus.on(POST_LIKED, handler)
    return () => eventBus.off(POST_LIKED, handler)
  }, [])
}

// 3. Feature emits result event
// After processing, emits REWARD_PROCESSED or REWARD_FAILED
```

### State Management by Use Case

#### **Server State** → TanStack Query

- API data, cached responses, background refetching
- **Location**: Entity API queries, Feature API calls
- **Invalidation**: Via Event Bus or direct `queryClient.invalidateQueries()`

#### **Global Client State** → Zustand

- Theme, modals, UI preferences
- **Location**: `src/shared/lib/stores/`
- **Persistence**: localStorage via `persist` middleware

#### **Cross-Feature Communication** → Event Bus

- Feature-to-feature communication without direct dependencies
- **Location**: `src/shared/lib/events/bus.ts`
- **Events**: Defined in `src/shared/lib/events/registry.ts`

#### **Component State** → React useState/useReducer

- Form state, UI toggle state, component-specific state
- **Location**: Component files

### Query Invalidation Strategy

**Invalidation Triggers:**

1. **Event-Driven**: Features emit events, listeners invalidate queries
2. **Direct**: `queryClient.invalidateQueries()` in feature models
3. **Optimistic Updates**: `queryClient.setQueryData()` for immediate UI updates

**Example:**

```typescript
// Event-driven invalidation
eventBus.on(PAYMENT_SUCCESS, () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.finance.all() })
})

// Direct invalidation
queryClient.invalidateQueries({ queryKey: queryKeys.posts.all() })
```

### Error Handling Flow

**Flow:**

1. **HTTP Client** catches errors
2. **HTTP Client** shows toast notification (unless `skipErrorToast: true`)
3. **TanStack Query** handles mutation errors
4. **Feature Model** can handle errors and emit failure events

**Example:**

```typescript
// HTTP Client automatically shows toast
await httpClient.post('/api/endpoint', data) // Error → Toast shown

// Skip toast for custom handling
await httpClient.post('/api/endpoint', data, { skipErrorToast: true })
// Handle error in mutation's onError
```

### Form Data Flow

**Flow:**

1. **Feature UI** renders form (React Hook Form)
2. **Validation** via Zod schema
3. **Submit** calls Feature Model
4. **Feature Model** calls API via HTTP Client
5. **Success/Error** handled in Feature Model

**Example:**

```typescript
// Feature UI
const form = useForm({
  resolver: zodResolver(schema),
})

const onSubmit = data => {
  processPayment(data) // Feature Model
}

// Feature Model
const processPayment = async data => {
  await httpClient.post('/api/payments', data)
  // Emit event, etc.
}
```

---

## Summary

This document serves as the **immutable source of truth** for all AI agents working on this project. Key principles:

1. **FSD Layering**: Strict layer isolation, dependencies flow downward only
2. **TanStack Router**: File-based routing with SSR support via API routes
3. **State Management**: TanStack Query (server), Zustand (client), Event Bus (cross-feature)
4. **Naming**: kebab-case files, PascalCase components, camelCase functions
5. **Data Flow**: Page → Feature UI → Feature Model → Entity API → HTTP Client → Server

**All code must adhere to these rules. No exceptions without explicit approval.**

---

**Document Status**: ✅ IMMUTABLE - Source of Truth  
**Maintained By**: Architecture Team  
**Review Cycle**: Quarterly (or on major architecture changes)
