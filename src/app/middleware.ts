/**
 * Middleware to protect routes
 * 
 * Note: This middleware is not currently used since we're using Vite instead of TanStack Start.
 * Authentication is handled in route beforeLoad hooks instead.
 * With mock auth, authentication is handled client-side.
 */
export const authMiddleware = async () => {
  // Mock auth is handled client-side, so this middleware just passes through
  // In a real app with server-side auth, you would check the session here
  return undefined
}

