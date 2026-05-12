# Changelog — frontend-sample template

Consumers fork or sync this repo as a baseline for **UI-only** services (see [README.md](README.md)). Use [SemVer](https://semver.org/) tags on this template (for example `template/v1.0.0`) and record breaking changes here so downstream repos can upgrade in order.

## How to upgrade a derived UI service

1. Fetch tags from this template remote and read the section for your current tag → target tag.
2. Merge or cherry-pick template `main` into your service repo, resolving conflicts preferring **your** `entities/`, `features/`, `pages/`, `routes/`, and `.env`.
3. Run `npm ci`, `npm run typecheck`, `npm run test:run`, and (optionally) Playwright locally.
4. Re-apply any customizations in `src/shared/lib/client-auth.ts` if you replaced mock auth with your backend.

## Unreleased

### Breaking (when released, move under a dated version header)

_(Nothing pending — next edits go here.)_

### Added / changed (working tree — copy into next `template/v…` section when you tag)

_(Nothing yet.)_

---

## template/v1.1.0 — 2026-05-12

### Summary

IAM alignment for Keycloak SSO, session refresh wiring, HTTP 401 token retry, Playwright isolation on port **4173**, and documentation updates.

### Migrate

1. **Playwright / CI:** Default E2E `baseURL` and `webServer` now use `http://localhost:4173`. Remove `VITE_E2E_BASE_URL=http://localhost:3000` from CI unless you intentionally override. Local `npm run dev` remains on port **3000**.
2. **Route `/login`:** Optional validated search param `redirect` (string). Deep links may use `/login?redirect=/dashboard`.
3. **`authGuard()`:** In `VITE_AUTH_MODE=keycloak`, unauthenticated users are sent through **`authClient.login()`** (OIDC) instead of only `/login`.
4. **Removed** unused `src/app/middleware.ts` — references in internal docs were updated; delete any fork-local imports.
5. **Mock session shape:** `getSession()` no longer returns internal `User`/`Session` types; it returns `AuthSessionData` with `user.roles: ['user']` for RBAC hooks.
6. **New modules:** `src/shared/lib/auth-role.ts` (`deriveAppRoleFromSession`), `attachKeycloakSessionSync` in `keycloak-auth.ts`, `e2e/helpers/mock-login.ts`.

### Details

- **RBAC:** `deriveAppRoleFromSession` maps Keycloak `roles[]` to template `Role`; permission hooks honor JWT `permissions` then static `permissions.ts`.
- **Keycloak:** `attachKeycloakSessionSync` invalidates session context on token/auth events; `httpClient` retries once after `401` when `updateToken` succeeds.
- **Docs:** Expanded `docs/auth-keycloak.md`, `.env.example` Keycloak/Sentry alignment, migration notes in `docs/migrations/template-v1.1.0.md`.

---

## template/v1.0.0 — YYYY-MM-DD

- Initial changelog structure for template consumers.

---

_Add new version blocks above when you tag releases._
