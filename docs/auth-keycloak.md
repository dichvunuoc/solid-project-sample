# Keycloak SSO Integration

This template supports a common IAM based on Keycloak through a single frontend auth facade:

- `src/shared/lib/client-auth.ts` is the only public auth entry point.
- `src/shared/lib/keycloak-auth.ts` contains the browser Keycloak adapter.
- `src/shared/lib/auth-token.ts` is what the HTTP client uses for bearer tokens.

## Recommended Flow

Use Authorization Code + PKCE for browser applications. Do not store access tokens or refresh tokens in `localStorage`. The Keycloak adapter keeps tokens in memory and refreshes them before API calls.

## Environment

Set these variables for a service that uses SSO:

```env
VITE_AUTH_MODE=keycloak
VITE_KEYCLOAK_URL=https://iam.example.com
VITE_KEYCLOAK_REALM=techgen
VITE_KEYCLOAK_CLIENT_ID=my-frontend-service
VITE_KEYCLOAK_ON_LOAD=check-sso
VITE_KEYCLOAK_SILENT_CHECK_SSO_REDIRECT_URI=https://my-service.example.com/silent-check-sso.html
```

For local development:

```env
VITE_AUTH_MODE=mock
VITE_USE_MOCK_AUTH=true
```

## Keycloak Client Setup

Create one public client per frontend service unless your IAM team has standardized a shared client. Configure:

- Client type: public
- Standard flow: enabled
- PKCE: S256
- Direct access grants: disabled for browser-only services
- Valid redirect URIs: service origin plus local dev origin, for example `http://localhost:3000/*`
- Web origins: service origin plus local dev origin
- Silent SSO page: `/silent-check-sso.html`

## Roles And Permissions

The adapter reads roles from:

- `realm_access.roles`
- `resource_access[VITE_KEYCLOAK_CLIENT_ID].roles`

It reads permissions from:

- `permissions`
- `authorization.permissions`, mapped to `resource:scope`

Frontend authorization should only control UX: route access, hidden buttons, disabled actions. Backend APIs must enforce authorization independently.

## Route Guard Usage

Current protected routes call:

```ts
beforeLoad: async () => {
  await authGuard()
}
```

The next template step should extend `authGuard` to accept required roles, scopes, or permissions:

```ts
beforeLoad: async () => {
  await authGuard({
    requireAuth: true,
    roles: ['finance-user'],
    permissions: ['finance:read'],
  })
}
```

## API Requests

`httpClient` calls `getAuthToken()`, which delegates to `authClient.getAccessToken()`. In Keycloak mode this refreshes the token with a 30 second minimum validity before returning the bearer token.

## Migration For Existing Services

1. Upgrade to this template version while keeping `VITE_AUTH_MODE=mock`.
2. Register the service client in Keycloak.
3. Add the Keycloak env values to the service environment.
4. Switch only one environment to `VITE_AUTH_MODE=keycloak`.
5. Validate login, logout, route protection, API bearer token, 401 behavior, and role mapping.
6. Roll the same env change to the remaining environments.
