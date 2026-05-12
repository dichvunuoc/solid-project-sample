/**
 * Auth Token Utility
 *
 * Utility functions for retrieving authentication tokens.
 * Works with the mock auth system and can be extended for real auth.
 */

import { authClient } from './client-auth'

/**
 * Get the current authentication token
 * @returns The auth token string or null if not authenticated
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await authClient.getAccessToken()
  } catch {
    return null
  }
}
