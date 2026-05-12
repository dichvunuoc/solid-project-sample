// Type definitions for TanStack Start context
declare module '@tanstack/start' {
  interface RequestContext {
    user?: {
      id: string
      email: string
      name?: string
      [key: string]: unknown
    }
    session?: {
      user: {
        id: string
        email: string
        name?: string
        [key: string]: unknown
      }
      session: {
        id: string
        expiresAt: Date
        [key: string]: unknown
      }
    }
  }
}

