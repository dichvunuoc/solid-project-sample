/**
 * Query Key Factory
 *
 * Centralized, type-safe query keys for TanStack Query.
 * FSD Rule: This is in the Shared layer, accessible to all layers.
 */

export const queryKeys = {
  session: () => ['session'] as const,
  posts: {
    all: () => ['posts'] as const,
    detail: (id: string) => ['posts', id] as const,
    likes: (postId: string) => ['posts', postId, 'likes'] as const,
  },
  rewards: {
    all: () => ['rewards'] as const,
    detail: (id: string) => ['rewards', id] as const,
    user: (userId: string) => ['rewards', 'user', userId] as const,
  },
  finance: {
    all: () => ['dashboard-stats'] as const,
    user: (userId: string) => ['finance', 'user', userId] as const,
  },
  order: {
    detail: (orderId: string) => ['order', orderId] as const,
  },
} as const
