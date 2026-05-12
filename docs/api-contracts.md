# API Contracts & Integration Patterns

**Project:** frontend-sample  
**Analysis Date:** 2025-12-31  
**Scan Level:** Deep

---

## Overview

This document catalogs all API contracts, HTTP client patterns, and integration strategies used in the `frontend-sample` application. The project uses a centralized HTTP client with TanStack Query for data fetching.

---

## API Architecture

### Base URL Configuration

**Location:** `src/shared/config/env.ts`

```typescript
VITE_API_URL: Environment variable for API base URL
Default: undefined (same-origin requests)
```

### HTTP Client

**Location:** `src/shared/api/http-client.ts`

**Features:**

- ✅ Request/Response interceptors
- ✅ Automatic auth token injection
- ✅ Error handling with toast notifications
- ✅ Timeout support (30s default)
- ✅ TypeScript generics for type-safe responses
- ✅ Abort controller for request cancellation

**Methods:**

- `GET` - Fetch resources
- `POST` - Create resources
- `PUT` - Full update
- `PATCH` - Partial update
- `DELETE` - Remove resources

**Configuration Options:**

```typescript
interface RequestConfig {
  skipErrorToast?: boolean // Skip automatic error toast
  skipAuth?: boolean // Skip auth token injection
  headers?: Record<string, string>
}
```

---

## Authentication API

### Auth Provider: Better Auth (Mock Mode)

**Location:** `src/shared/api/better-auth.ts`

**Current Status:** 🟡 **Mock Implementation**

The application currently uses a mock auth system. Real Better Auth with Prisma is commented out and ready to be enabled.

**Mock Auth Client:**
**Location:** `src/shared/lib/mock-auth.ts`

**Endpoints (Simulated):**

#### Sign In

```typescript
POST /api/auth/sign-in (client-side mock)

Request:
{
  email: string
  password: string
}

Response:
{
  user: {
    id: string
    email: string
    name: string
    role: 'admin' | 'moderator' | 'user' | 'guest'
  }
  session: {
    token: string
    expiresAt: string
  }
}
```

#### Sign Up

```typescript
POST /api/auth/sign-up (client-side mock)

Request:
{
  email: string
  password: string
  name?: string
}

Response:
{
  user: {
    id: string
    email: string
    name: string
    role: 'user'
  }
  session: {
    token: string
    expiresAt: string
  }
}
```

#### Get Session

```typescript
GET /api/auth/session (client-side mock)

Headers:
  Authorization: Bearer {token}

Response:
{
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  session: {
    token: string
    expiresAt: string
  }
}
```

#### Sign Out

```typescript
POST /api/auth/sign-out (client-side mock)

Headers:
  Authorization: Bearer {token}

Response:
{
  success: boolean
}
```

### Auth Client

**Location:** `src/shared/lib/client-auth.ts`

**Usage:**

```typescript
import { authClient } from '@/shared/lib/client-auth'

// Sign in
await authClient.signIn.email({ email, password })

// Sign up
await authClient.signUp.email({ email, password, name })

// Get session
const session = await authClient.getSession()

// Sign out
await authClient.signOut()
```

---

## Query Keys Strategy

**Location:** `src/shared/api/query-keys.ts`

The application uses a **hierarchical query key factory** for TanStack Query cache management.

**Structure:**

```typescript
export const queryKeys = {
  // Session queries
  session: () => ['session'] as const,

  // Finance/Dashboard queries
  finance: {
    all: () => ['finance'] as const,
    stats: () => ['finance', 'stats'] as const,
    orders: () => ['finance', 'orders'] as const,
  },

  // Order queries
  order: {
    all: () => ['order'] as const,
    detail: (id: string) => ['order', id] as const,
  },

  // Post queries
  post: {
    all: () => ['posts'] as const,
    detail: (id: string) => ['posts', id] as const,
    likes: (id: string) => ['posts', id, 'likes'] as const,
  },
}
```

**Benefits:**

- ✅ Type-safe query keys
- ✅ Easy invalidation patterns
- ✅ Consistent naming conventions
- ✅ Hierarchical cache management

---

## Entity API Patterns

### Finance Entity API

**Location:** `src/entities/finance/api/queries.ts`

#### Get Dashboard Stats

**Query Options:**

```typescript
export const dashboardStatsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.finance.all(),
    queryFn: async (): Promise<DashboardStats> => {
      // Simulated API call (localStorage-backed)
      const stored = localStorage.getItem('dashboard_stats')
      const stats = stored ? JSON.parse(stored) : defaultStats

      return {
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.totalOrders,
        averageOrderValue: stats.totalRevenue / stats.totalOrders,
        stats: [...]
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
```

**Type:**

```typescript
interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  stats: Stat[]
}

interface Stat {
  id: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: string
}
```

#### Get Order Details

**Query Options:**

```typescript
export const orderQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: queryKeys.order.detail(orderId),
    queryFn: async (): Promise<Order> => {
      // Simulated API call
      return {
        id: orderId,
        amount: 99.99,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
    },
    staleTime: 1000 * 60, // 1 minute
  })
```

**Type:**

```typescript
interface Order {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}
```

---

### Session Entity API

**Location:** `src/entities/session/api/use-session.ts`

#### Get Current Session

**Hook:**

```typescript
export function useSession() {
  return useQuery({
    queryKey: queryKeys.session(),
    queryFn: async () => {
      const session = await authClient.getSession()
      return session
    },
  })
}
```

**Return Type:**

```typescript
{
  data: Session | null
  isLoading: boolean
  isError: boolean
  error: Error | null
}

interface Session {
  user: {
    id: string
    email: string
    name: string
    role: 'admin' | 'moderator' | 'user' | 'guest'
  }
  session: {
    token: string
    expiresAt: string
  }
}
```

---

### Post Entity API

**Location:** `src/entities/post/api/like-post.ts`

#### Like Post Mutation

**Hook:**

```typescript
export function useLikePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return { postId, liked: true }
    },
    onSuccess: (_, postId) => {
      // Invalidate post likes query
      queryClient.invalidateQueries({
        queryKey: queryKeys.post.likes(postId),
      })
    },
  })
}
```

---

## Feature API Patterns

### Process Payment Feature

**Location:** `src/features/process-payment/model/use-process-payment.ts`

#### Execute Payment

**Hook:**

```typescript
export function useProcessPayment() {
  return useMutation({
    mutationFn: async (params: PaymentParams) => {
      // Simulated payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const success = Math.random() > 0.3 // 70% success rate

      if (success) {
        // Emit success event
        eventRegistry.emit(PAYMENT_SUCCESS, {
          orderId: params.orderId,
          amount: params.amount,
          timestamp: new Date().toISOString(),
        })

        return { success: true, orderId: params.orderId }
      } else {
        // Emit failure event
        eventRegistry.emit(PAYMENT_FAILED, {
          orderId: params.orderId,
          reason: 'Insufficient funds',
          timestamp: new Date().toISOString(),
        })

        throw new Error('Payment failed')
      }
    },
  })
}
```

**Type:**

```typescript
interface PaymentParams {
  orderId: string
  amount: number
  method?: string
}
```

---

### Process Rewards Feature

**Location:** `src/features/process-rewards/api/use-reward-chain.ts`

#### Execute Reward Chain

**Hook:**

```typescript
export function useRewardChain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      // Orchestrates multiple reward steps
      const step1 = await validateRewards()
      const step2 = await calculatePoints(step1)
      const step3 = await applyRewards(step2)

      return step3
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['rewards'],
      })
    },
  })
}
```

---

## Event-Driven API Integration

### Event Bus Architecture

**Location:** `src/shared/api/events/`

The application uses an event-driven architecture for loose coupling between features.

**Event Registry:**

```typescript
import { eventRegistry } from '@/shared/api/events'

// Emit events
eventRegistry.emit(PAYMENT_SUCCESS, payload)

// Subscribe to events
eventRegistry.on(PAYMENT_SUCCESS, handler)

// Unsubscribe
eventRegistry.off(PAYMENT_SUCCESS, handler)
```

**Defined Events:**

#### Payment Events

```typescript
// Payment Success
interface PaymentSuccessEvent {
  orderId: string
  amount: number
  timestamp: string
}
const PAYMENT_SUCCESS = 'payment:success'

// Payment Failed
interface PaymentFailedEvent {
  orderId: string
  reason: string
  timestamp: string
}
const PAYMENT_FAILED = 'payment:failed'
```

#### Reward Events

```typescript
// Reward Applied
interface RewardAppliedEvent {
  userId: string
  rewardId: string
  points: number
  timestamp: string
}
const REWARD_APPLIED = 'reward:applied'
```

#### Post Events

```typescript
// Post Liked
interface PostLikedEvent {
  postId: string
  userId: string
  timestamp: string
}
const POST_LIKED = 'post:liked'
```

#### User Events

```typescript
// User Profile Updated
interface UserUpdatedEvent {
  userId: string
  changes: Partial<User>
  timestamp: string
}
const USER_UPDATED = 'user:updated'
```

#### Notification Events

```typescript
// Notification Received
interface NotificationEvent {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: string
}
const NOTIFICATION_RECEIVED = 'notification:received'
```

---

## Error Handling Patterns

### HTTP Client Error Handling

**Automatic Toast Notifications:**

```typescript
// Automatic error toast (default)
await httpClient.get('/api/data')
// On error: Shows toast with error message

// Skip error toast
await httpClient.get('/api/data', { skipErrorToast: true })
// On error: No toast, error thrown
```

### Query Error Handling

**TanStack Query Error Boundary:**

```typescript
// Global error boundary in app/providers.tsx
<ErrorBoundary>
  <QueryProvider>
    {children}
  </QueryProvider>
</ErrorBoundary>
```

**Per-Query Error Handling:**

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
})

if (isError) {
  return <div>Error: {error.message}</div>
}
```

---

## API Mocking (MSW)

**Location:** `src/shared/api/mocks/`

The project uses Mock Service Worker (MSW) for API mocking during development and testing.

**Setup Files:**

- `handlers.ts` - Request handlers
- `browser.ts` - Browser mock setup
- `server.ts` - Node/test mock setup

**Example Handler:**

```typescript
// src/shared/api/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/stats', () => {
    return HttpResponse.json({
      totalRevenue: 125430.5,
      totalOrders: 1243,
    })
  }),
]
```

---

## Rate Limiting & Caching

### TanStack Query Cache Configuration

**Location:** `src/app/providers/query-provider.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
```

---

## API Integration Best Practices

### ✅ Implemented Patterns

1. **Centralized HTTP Client** - Single source of truth for API calls
2. **Query Key Factory** - Consistent, type-safe query keys
3. **Event-Driven Updates** - Features communicate via events
4. **Optimistic Updates** - Immediate UI updates with rollback
5. **Automatic Cache Invalidation** - Event-based cache updates
6. **Type-Safe Responses** - TypeScript generics throughout
7. **Error Handling** - Automatic toast notifications
8. **Request Cancellation** - Abort controller for long requests

### 🟡 Future Enhancements

1. **Real API Integration** - Replace mock auth with Better Auth + Prisma
2. **Request Deduplication** - Prevent duplicate concurrent requests
3. **Retry Logic** - Exponential backoff for failed requests
4. **Request Batching** - Combine multiple requests
5. **GraphQL Support** - Optional GraphQL client layer
6. **WebSocket Support** - Real-time updates via WebSocket

---

## Migration to Production API

### Steps to Enable Real Better Auth

1. **Uncomment Better Auth Configuration:**

```typescript
// src/shared/api/better-auth.ts
import { betterAuth as createBetterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/shared/lib/prisma'

export const betterAuth = createBetterAuth({
  database: prismaAdapter({ prisma }),
  emailAndPassword: { enabled: true },
})
```

2. **Update Environment Variables:**

```env
DATABASE_URL="your-database-url"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

3. **Run Migrations:**

```bash
npx prisma migrate dev
```

4. **Remove Mock Auth:**

- Remove `src/shared/lib/mock-auth.ts`
- Update imports to use real auth client

---

## API Contract Summary

| Endpoint             | Method   | Entity  | Status          |
| -------------------- | -------- | ------- | --------------- |
| `/api/auth/sign-in`  | POST     | Session | 🟡 Mock         |
| `/api/auth/sign-up`  | POST     | Session | 🟡 Mock         |
| `/api/auth/session`  | GET      | Session | 🟡 Mock         |
| `/api/auth/sign-out` | POST     | Session | 🟡 Mock         |
| Dashboard Stats      | Query    | Finance | 🟡 LocalStorage |
| Order Details        | Query    | Finance | 🟡 Simulated    |
| Like Post            | Mutation | Post    | 🟡 Simulated    |
| Process Payment      | Mutation | Payment | 🟡 Simulated    |
| Process Rewards      | Mutation | Rewards | 🟡 Simulated    |

**Legend:**

- 🟡 Mock - Client-side mock implementation
- ✅ Live - Real API integration
- 🔴 Disabled - Not implemented

---

## Conclusion

The `frontend-sample` project demonstrates a **well-architected API integration layer** with clear patterns, type safety, and excellent separation of concerns. The mock implementation provides a solid foundation for transitioning to a real backend API.

**Key Strengths:**

- ✅ Centralized HTTP client with interceptors
- ✅ Type-safe query/mutation patterns
- ✅ Event-driven cache updates
- ✅ Comprehensive error handling
- ✅ Easy migration path to production API

**Next Steps:**

1. Enable real Better Auth with Prisma
2. Implement actual backend API endpoints
3. Add request deduplication and batching
4. Implement WebSocket for real-time updates
