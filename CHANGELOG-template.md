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

### Released in working tree (document when you tag)

- **Auth contract:** Added `VITE_AUTH_MODE`, Keycloak env validation, a stable `authClient` facade, and a `keycloak-js` SSO adapter skeleton.
- **SSO docs:** Added `docs/auth-keycloak.md` and `/silent-check-sso.html` for Keycloak `check-sso`.
- **SPA-only:** Removed Prisma, Better Auth, `src/routes/api/`, `prisma/`, and stub DB clients; auth is backend-owned — see README + `client-auth.ts`.
- **Tooling:** ESLint 9 flat (`eslint.config.mjs`), Vitest 2, `@tanstack/router-cli` + `routes:generate` + `pretypecheck` / `pretest:run`.
- **Vite:** Dev and preview on port **3000** (Playwright-aligned); `routeTree.gen.ts` committed and removed from `.gitignore`.
- **CI:** GitHub Actions workflow lint, typecheck, Vitest, Playwright Chromium.
- **Docs:** README / `.env.example` / `CHANGELOG-template.md` / `RELEASING.md` / `docs/data-models.md` / `docs/QUICK_START.md` banner updated for micro-UI + external API.

---

_Add version blocks below when you tag releases, for example:_

## template/v1.0.0 — YYYY-MM-DD

- Initial changelog structure for template consumers.
