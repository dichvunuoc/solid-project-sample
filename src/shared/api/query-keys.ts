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

  sampleItems: {
    all: () => ['sample-items'] as const,
    detail: (id: string) => ['sample-items', id] as const,
  },
} as const
