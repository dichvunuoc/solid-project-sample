/**
 * MSW (Mock Service Worker) Request Handlers
 *
 * Define mock API responses for testing and development.
 * Paths are matched relative to VITE_API_URL (use wildcard host prefix).
 */

import { http, HttpResponse } from 'msw'

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

const mockSampleItems = {
  items: [
    {
      id: 'item-1',
      title: 'Onboard service A',
      status: 'active' as const,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-2',
      title: 'Wire Keycloak client',
      status: 'draft' as const,
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  total: 2,
}

export const handlers = [
  http.get('*/sample-items', () => HttpResponse.json(mockSampleItems)),

  http.get('*/api/session', () => HttpResponse.json(mockSession)),

  http.get('*/auth/session', () =>
    HttpResponse.json({
      user: mockSession.user,
      session: { token: 'session-cookie' },
    })
  ),

  http.get('*/auth/csrf', () => HttpResponse.json({ csrfToken: 'mock-csrf-token' })),

  http.post('*/api/auth/sign-in', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.email && body.password) {
      return HttpResponse.json(mockSession)
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('*/api/auth/sign-out', () => HttpResponse.json({ success: true })),
]
