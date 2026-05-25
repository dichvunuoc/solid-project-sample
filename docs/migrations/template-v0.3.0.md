# Migration Guide: Template v0.2.0 → v0.3.0

## Summary

This release focuses on **security hardening**, **performance optimization**, and **enterprise IAM readiness**.

## Breaking Changes

### 1. Button component consolidated to Shadcn

**Before:**
```tsx
import { Button } from '@/shared/ui/button'
<Button variant="primary" size="md">Click</Button>
```

**After:**
```tsx
import { Button } from '@/shared/ui/button' // same import, now re-exports Shadcn
<Button variant="default" size="default">Click</Button>
```

Variant mapping:
- `primary` → `default`
- `secondary` → `secondary`
- `danger` → `destructive`

Size mapping:
- `sm` → `sm`
- `md` → `default`
- `lg` → `lg`

### 2. Route guards enhanced

New exports in `@/shared/lib/route-guards`:
- `roleGuard(role)` — redirect if user lacks the role
- `permissionGuard(permission)` — redirect if user lacks the permission
- `routeAccessGuard(path)` — check static route-role mapping

### 3. Event bus: new `useEventListener` hook

**Before:**
```tsx
onMount(() => {
  const handler = (e: PostLikedEvent) => { /* ... */ }
  eventBus.on(POST_LIKED, handler)
  onCleanup(() => eventBus.off(POST_LIKED, handler))
})
```

**After:**
```tsx
useEventListener(POST_LIKED, (e: PostLikedEvent) => { /* ... */ })
```

## New Features

| Feature | Description |
|---|---|
| Auto code splitting | Routes are now lazy-loaded automatically |
| Token caching | Reduces redundant Keycloak token refresh calls |
| Auth initializer | Loading state during Keycloak initialization |
| Idle session timeout | Auto-logout after 15 minutes of inactivity |
| Multi-tab session sync | BroadcastChannel-based cross-tab auth sync |
| Backend-session auth adapter | Cookie-based sessions with CSRF protection |
| Multi-tenant Keycloak | `VITE_KEYCLOAK_TENANT_REALM` for per-tenant realms |
| Permission components | `<ShowRole>`, `<ShowPermission>`, `<ShowAuthenticated>` |
| Audit logging | `logAuditEvent()` for security event tracking |
| CSP + security headers | nginx.conf now includes CSP, Permissions-Policy |
| Mock auth stripped in prod | Production builds no longer contain mock auth code |
| Test coverage thresholds | Vitest enforces 50% line/statement coverage |

## Environment Variables

New variables in `.env`:

```bash
# Multi-tenant Keycloak (optional)
VITE_KEYCLOAK_TENANT_REALM=
```

## Migration Steps

1. Update variant/size props on `Button` components (search for `variant="primary"`)
2. Optionally migrate event listeners to `useEventListener` hook
3. Add new env variables to your `.env` if using multi-tenant Keycloak
4. Run `npm run test:run` to verify all tests pass
5. Run `npm run build` and review bundle size changes
