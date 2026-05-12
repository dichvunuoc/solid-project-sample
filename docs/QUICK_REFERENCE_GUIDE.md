# 🎯 Quick Reference Guide - Team Boilerplate

**Project Score:** 8.5/10 ⭐⭐⭐⭐  
**Status:** Production-Ready (after Phase 1 & 2 fixes)  
**Architecture:** Feature-Sliced Design (FSD)  
**Review Date:** December 31, 2025

---

## 📊 At a Glance

### ✅ What's Excellent

| Feature            | Status     | Notes                                              |
| ------------------ | ---------- | -------------------------------------------------- |
| Architecture (FSD) | ⭐⭐⭐⭐⭐ | Properly implemented, scales to 100+ screens       |
| TypeScript Config  | ⭐⭐⭐⭐⭐ | Strict mode, excellent type safety                 |
| State Management   | ⭐⭐⭐⭐⭐ | Perfect hybrid approach (TanStack Query + Zustand) |
| Testing Setup      | ⭐⭐⭐⭐⭐ | Vitest + Playwright + MSW                          |
| UI Components      | ⭐⭐⭐⭐⭐ | Shadcn + Tailwind, consistent                      |
| Code Quality       | ⭐⭐⭐⭐⭐ | ESLint + Prettier + Husky                          |
| Event Bus          | ⭐⭐⭐⭐⭐ | Type-safe, decouples features                      |
| RBAC System        | ⭐⭐⭐⭐⭐ | Complete permissions implementation                |
| Feature Flags      | ⭐⭐⭐⭐⭐ | Enterprise-grade toggles                           |
| Documentation      | ⭐⭐⭐⭐   | Comprehensive but needs minor additions            |

### ⚠️ What Needs Attention

| Issue                        | Priority    | Time to Fix |
| ---------------------------- | ----------- | ----------- |
| Missing `.env.example`       | 🔴 Critical | 15 min      |
| Sentry not installed         | 🔴 Critical | 5 min       |
| No Web Vitals tracking       | 🔴 Critical | 30 min      |
| Missing CONTRIBUTING.md      | 🟠 High     | 45 min      |
| No centralized error handler | 🟠 High     | 45 min      |

**Total Critical Fixes Time:** ~2-3 hours

---

## 🏗️ Architecture Overview

```
src/
├── app/          # ⚙️  App initialization, providers, middleware
├── pages/        # 📄 Route entry points, compose features/entities
├── widgets/      # 🧩 Complex UI blocks (Header, Sidebar) [Currently minimal]
├── features/     # ⚡ User interactions (auth, payments, rewards)
├── entities/     # 🏛️  Business entities (session, finance, post)
└── shared/       # 🔧 Reusable utilities, UI kit, API clients
```

### Import Rules (Enforced by ESLint)

```typescript
// ✅ ALLOWED: Lower layers can import from shared
import { Button } from '@/shared/ui'

// ✅ ALLOWED: Features can import from entities
import { useSession } from '@/entities/session'

// ❌ FORBIDDEN: Shared cannot import from features
import { SignInForm } from '@/features/auth/sign-in' // ERROR!

// ❌ FORBIDDEN: Entities cannot import from features
import { usePayment } from '@/features/process-payment' // ERROR!
```

**Key Rule:** Import flow is always **downward** (app → pages → widgets → features → entities → shared)

---

## 📦 Tech Stack

### Core

- **Framework:** React 18.3 + TypeScript 5.5
- **Build Tool:** Vite 5.4
- **Routing:** TanStack Router (file-based, type-safe)
- **Styling:** Tailwind CSS + Shadcn UI

### State Management

- **Server State:** TanStack Query (caching, refetching)
- **Global UI State:** Zustand (theme, modals)
- **Forms:** React Hook Form + Zod
- **Events:** Mitt (type-safe event bus)

### Data & API

- **HTTP Client:** Custom wrapper with interceptors
- **Validation:** Zod schemas
- **Database:** Prisma or Drizzle (choose one)
- **Auth:** Better Auth

### Testing

- **Unit Tests:** Vitest + React Testing Library
- **E2E Tests:** Playwright (multi-browser)
- **Mocking:** MSW (Mock Service Worker)

### Code Quality

- **Linting:** ESLint (strict config)
- **Formatting:** Prettier
- **Git Hooks:** Husky + lint-staged
- **TypeScript:** Strict mode enabled

### Production Features

- **Error Monitoring:** Sentry (needs installation)
- **RBAC:** Complete permissions system
- **Feature Flags:** Toggle features without deploys
- **Bundle Analysis:** Visualizer for size tracking

---

## 🚀 Common Commands

```bash
# Development
npm run dev                  # Start dev server (http://localhost:3000)
npm run build               # Build for production
npm run start               # Preview production build

# Code Quality
npm run lint                # Check linting errors
npm run lint:fix            # Auto-fix linting errors
npm run format              # Format all files
npm run typecheck           # Check TypeScript types

# Testing
npm test                    # Run unit tests (watch mode)
npm run test:run            # Run unit tests (once)
npm run test:coverage       # Generate coverage report
npm run test:e2e            # Run E2E tests (Playwright)

# Git Hooks
npm run prepare             # Initialize Husky hooks
```

---

## 📁 Project Structure Cheat Sheet

### Creating a New Feature

**Example:** Add "Create Post" feature

1. **Create feature folder:**

   ```
   src/features/create-post/
   ├── api/
   │   └── use-create-post.ts    # API logic
   ├── ui/
   │   └── CreatePostForm.tsx    # UI component
   ├── model/
   │   └── types.ts              # Types/interfaces
   └── index.ts                  # Public API
   ```

2. **Implement API hook:**

   ```typescript
   // api/use-create-post.ts
   import { useMutation } from '@tanstack/react-query'
   import { httpClient } from '@/shared/api/http-client'

   export function useCreatePost() {
     return useMutation({
       mutationFn: data => httpClient.post('/posts', data),
       onSuccess: () => {
         // Invalidate queries, emit events, etc.
       },
     })
   }
   ```

3. **Export from index.ts:**

   ```typescript
   // index.ts
   export { CreatePostForm } from './ui/CreatePostForm'
   export { useCreatePost } from './api/use-create-post'
   ```

4. **Use in page:**

   ```typescript
   // pages/dashboard/index.tsx
   import { CreatePostForm } from '@/features/create-post'

   export function DashboardPage() {
     return <CreatePostForm />
   }
   ```

### Creating a New Entity

**Example:** Add "Comment" entity

1. **Create entity folder:**

   ```
   src/entities/comment/
   ├── api/
   │   ├── queries.ts            # TanStack Query hooks
   │   └── mutations.ts          # Mutation hooks
   ├── ui/
   │   └── CommentCard.tsx       # Display component
   ├── model/
   │   └── types.ts              # Comment type
   └── index.ts                  # Public API
   ```

2. **Define types:**

   ```typescript
   // model/types.ts
   export interface Comment {
     id: string
     text: string
     authorId: string
     createdAt: Date
   }
   ```

3. **Create query:**

   ```typescript
   // api/queries.ts
   import { useQuery } from '@tanstack/react-query'
   import { queryKeys } from '@/shared/api/query-keys'

   export function useComments(postId: string) {
     return useQuery({
       queryKey: queryKeys.comments.list(postId),
       queryFn: () => fetchComments(postId),
     })
   }
   ```

---

## 🎨 Styling Conventions

### Using Tailwind Classes

```tsx
// ✅ Good: Compose classes with cn()
import { cn } from '@/shared/lib/utils'

;<div
  className={cn(
    'flex items-center gap-4',
    isActive && 'bg-blue-500',
    className // Accept external classes
  )}
/>
```

### Creating Variants

```tsx
// Use class-variance-authority for variants
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'px-4 py-2 rounded-lg', // base styles
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-500 text-white',
      },
      size: {
        sm: 'text-sm',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
    },
  }
)
```

---

## 🔐 Authentication Patterns

### Protecting Routes

```typescript
// routes/dashboard.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  beforeLoad: async ({ context }) => {
    const session = await authClient.getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { user: session.user }
  },
})
```

### Using Session in Components

```typescript
import { useSession } from '@/entities/session/api/use-session'

function ProfileButton() {
  const { data: session, isLoading } = useSession()

  if (isLoading) return <Spinner />
  if (!session) return <LoginButton />

  return <div>Welcome, {session.user.email}</div>
}
```

---

## 🎯 State Management Decision Tree

**When to use what?**

```
Need data from API?
├─ YES → Use TanStack Query
│  ├─ Fetching → useQuery()
│  ├─ Creating/Updating → useMutation()
│  └─ Caching → queryKeys factory
│
└─ NO → Is it global UI state?
   ├─ YES → Use Zustand
   │  └─ Examples: theme, sidebar open/closed, modal state
   │
   └─ NO → Is it cross-feature communication?
      ├─ YES → Use Event Bus
      │  └─ Examples: payment success → update dashboard
      │
      └─ NO → Use React useState
         └─ Examples: form inputs, local toggles
```

---

## 📝 Form Handling Pattern

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Define schema
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormData = z.infer<typeof formSchema>

// 2. Create form
export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  // 3. Handle submission
  const onSubmit = async (data: FormData) => {
    // API call here
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('email')}
        error={errors.email?.message}
      />
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

---

## 🚦 Event Bus Usage

### When to Use Events

✅ **Use Event Bus When:**

- Features need to communicate without direct coupling
- Multiple features react to same action
- Audit logging / analytics tracking
- Cross-cutting concerns (notifications)

❌ **Don't Use Event Bus When:**

- Data flows naturally through props
- Parent-child component communication
- Single consumer (just call directly)

### Example: Payment → Dashboard Update

```typescript
// features/process-payment/model/use-payment.ts
import { eventBus, PaymentSuccessEvent, PAYMENT_SUCCESS } from '@/shared/lib/events'

const handlePaymentSuccess = () => {
  const event = new PaymentSuccessEvent({
    orderId: '123',
    amount: 100,
  })
  eventBus.emit(PAYMENT_SUCCESS, event)
}

// features/dashboard-sync/model/use-dashboard-sync.ts
import { eventBus, PAYMENT_SUCCESS } from '@/shared/lib/events'
import { queryClient } from '@/shared/api/query-client'

useEffect(() => {
  const handler = event => {
    // Refresh dashboard data
    queryClient.invalidateQueries(queryKeys.finance.all())
  }

  eventBus.on(PAYMENT_SUCCESS, handler)
  return () => eventBus.off(PAYMENT_SUCCESS, handler)
}, [])
```

---

## 🔍 Debugging Tips

### TanStack Query DevTools

```typescript
// Already installed! Open in browser
// Shortcut: Click the React Query icon in dev tools
```

### Event Bus Debugging

```typescript
// Log all events (in development)
if (import.meta.env.DEV) {
  eventBus.on('*', (type, event) => {
    console.log('[Event]', type, event)
  })
}
```

### React DevTools Profiler

```bash
# Install React DevTools browser extension
# Use Profiler tab to find re-render issues
```

---

## 🎓 Learning Resources

### FSD (Feature-Sliced Design)

- Official docs: https://feature-sliced.design/
- Project structure: See `PROJECT_STRUCTURE.md`

### TanStack Query

- Official docs: https://tanstack.com/query/latest
- Query keys: See `src/shared/api/query-keys.ts`

### Shadcn UI

- Official docs: https://ui.shadcn.com/
- Project guide: See `SHADCN_GUIDE.md`

### Event Bus

- Project guide: See `EVENT_BUS_GUIDE.md`

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found: @/features/..."

**Solution:** VSCode/IDE needs to restart TypeScript server.

- `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Issue: ESLint import order warnings

**Solution:** Run auto-fix.

```bash
npm run lint:fix
```

### Issue: Type errors in event handlers

**Solution:** Ensure event payload type matches.

```typescript
// ✅ Correct
eventBus.on(POST_LIKED, (event: PostLikedEvent) => {})

// ❌ Wrong
eventBus.on(POST_LIKED, event => {}) // Missing type
```

### Issue: Query not refetching

**Solution:** Check if query key changed.

```typescript
// Query keys must be unique and change with params
queryKey: queryKeys.posts.detail(postId) // ✅ Changes with postId
queryKey: ['posts', 'detail'] // ❌ Always the same
```

---

## 📞 Getting Help

1. **Check Documentation:** `README.md`, `PROJECT_STRUCTURE.md`, guides in root
2. **Search Codebase:** Use examples as reference
3. **Ask Team:** Post in team Slack/Discord channel
4. **Review Guide:** See `EVENT_BUS_GUIDE.md`, `SHADCN_GUIDE.md`
5. **Official Docs:** TanStack, Shadcn, FSD websites

---

## ✅ Quick Checklist for New Developers

**First Day Setup:**

- [ ] Clone repo
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env` and fill values
- [ ] Run `npm run prepare` (Husky hooks)
- [ ] Run `npm run dev` (should start on :3000)
- [ ] Read `README.md` and `PROJECT_STRUCTURE.md`
- [ ] Review 2-3 existing features to understand patterns

**First Feature:**

- [ ] Choose feature type (create-post, edit-profile, etc.)
- [ ] Create folder in `src/features/`
- [ ] Add `api/`, `ui/`, `model/` subfolders
- [ ] Implement using TanStack Query + Zod
- [ ] Export from `index.ts`
- [ ] Use in a page component
- [ ] Test with `npm test`
- [ ] Run `npm run lint:fix` before commit
- [ ] Create PR for review

---

## 🎯 Next Steps

1. **Review Full Report:** See `ARCHITECTURAL_REVIEW_REPORT.md`
2. **Start Improvements:** See `BOILERPLATE_IMPROVEMENT_CHECKLIST.md`
3. **Onboard Team:** Schedule introduction meeting
4. **Create First Project:** Clone and start building!

---

**Quick Reference Version:** 1.0  
**Last Updated:** December 31, 2025  
**Maintain This:** Update as patterns evolve
