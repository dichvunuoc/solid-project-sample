/**
 * Query Key Factory
 *
 * Centralized, type-safe query keys for TanStack Query.
 * Add your domain query keys here as your application grows.
 *
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

export const queryKeys = {
  session: () => ['session'] as const,

  // Add your domain query keys here. Example:
  // users: {
  //   all: () => ['users'] as const,
  //   detail: (id: string) => ['users', id] as const,
  // },
} as const
