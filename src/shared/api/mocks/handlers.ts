/**
 * MSW (Mock Service Worker) Request Handlers
 *
 * Define mock API responses for testing and development.
 * Add your domain-specific handlers here.
 */

import { http, HttpResponse } from 'msw'

// Mock user session
const mockSession = {
  user: {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    roles: ['user'],
  },
  session: {
    id: 'session-1',
    userId: '1',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
}

/**
 * API Request Handlers
 *
 * Define handlers for different API endpoints.
 * Use http.get, http.post, http.put, http.delete, etc.
 */
export const handlers = [
  // Session endpoints
  http.get('/api/session', () => {
    return HttpResponse.json(mockSession)
  }),

  http.post('/api/auth/sign-in', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    if (body.email && body.password) {
      return HttpResponse.json(mockSession)
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('/api/auth/sign-out', () => {
    return HttpResponse.json({ success: true })
  }),

  // Add your domain handlers below:
]
