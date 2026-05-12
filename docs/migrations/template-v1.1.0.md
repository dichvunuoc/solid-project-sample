# Migration: template/v1.0.x → template/v1.1.0

Use this checklist when merging the template into a downstream UI service.

## Environment

- [ ] **E2E / Playwright:** Default `baseURL` is `http://localhost:4173` (see `playwright.config.ts`). Remove `VITE_E2E_BASE_URL=http://localhost:3000` from CI unless you override deliberately. Day-to-day dev stays `npm run dev` on port **3000**.
- [ ] **Keycloak:** If you use SSO, confirm `VITE_KEYCLOAK_SILENT_CHECK_SSO_REDIRECT_URI` is an **absolute** URL to `/silent-check-sso.html` for each deployed origin.

## Auth and routes

- [ ] **`authGuard`:** In Keycloak mode, guards call `authClient.login()` with the current URL as return target. Ensure your Keycloak client allows those redirect URI patterns.
- [ ] **`/login`:** Supports optional `?redirect=/path` (validated in `src/routes/login.tsx`). Update deep links or bookmarks if you relied on a different query shape.
- [ ] **Login / register UI:** When `VITE_AUTH_MODE=keycloak`, login and register pages show SSO CTAs instead of local password forms.

## Code removals

- [ ] **Deleted file:** `src/app/middleware.ts` was unused; remove any local imports or copies.

## Session and RBAC

- [ ] **Mock auth:** `mock-auth` `getSession()` now returns `AuthSessionData` with `user.roles: ['user']`. Adjust tests if they asserted on the old shape.
- [ ] **Permission hooks:** `usePermission` / related hooks now derive role from `user.roles[]` and honor JWT `permissions` before static `permissions.ts`. Align Keycloak realm/client role **names** with `ROLES` in `src/shared/lib/permissions.ts`, or rely on token permissions.

## HTTP client

- [ ] **401 handling:** `httpClient` may call `authClient.updateToken` and retry once. If you wrapped `fetch` elsewhere, avoid double-refresh logic.

## Verification

```bash
npm ci
npm run typecheck
npm run test:run
npm run test:e2e:chromium
```

For Keycloak-backed services, run a manual smoke test from `docs/auth-keycloak.md` (login, logout, protected route, API bearer, near-expiry token).
