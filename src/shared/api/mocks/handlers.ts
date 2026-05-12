/**
 * MSW (Mock Service Worker) Request Handlers
 *
 * Define mock API responses for testing and development.
 * These handlers intercept network requests and return mock data.
 */

import { http, HttpResponse } from 'msw'

// Mock user session
const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
  },
  session: {
    id: 'session-1',
    userId: '1',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
}

// Mock dashboard stats
const mockDashboardStats = {
  totalRevenue: 125430.5,
  totalOrders: 1243,
  averageOrderValue: 100.91,
  lastPaymentAmount: 150.0,
  lastPaymentTime: new Date().toISOString(),
  stats: [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: 125430.5,
      change: 12.5,
      icon: 'dollar-sign',
    },
    {
      id: 'orders',
      label: 'Total Orders',
      value: 1243,
      change: 8.2,
      icon: 'shopping-cart',
    },
    {
      id: 'avg-order',
      label: 'Avg Order Value',
      value: 100.91,
      change: 4.3,
      icon: 'trending-up',
    },
  ],
}

// Mock posts
const mockPosts = [
  {
    id: '1',
    title: 'First Post',
    content: 'This is the first post',
    author: 'Test User',
    createdAt: new Date().toISOString(),
    likes: 10,
  },
  {
    id: '2',
    title: 'Second Post',
    content: 'This is the second post',
    author: 'Test User',
    createdAt: new Date().toISOString(),
    likes: 5,
  },
]

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

    // Simulate authentication
    if (body.email && body.password) {
      return HttpResponse.json(mockSession)
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('/api/auth/sign-out', () => {
    return HttpResponse.json({ success: true })
  }),

  // Dashboard endpoints
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json(mockDashboardStats)
  }),

  // Posts endpoints
  http.get('/api/posts', () => {
    return HttpResponse.json(mockPosts)
  }),

  http.get('/api/posts/:id', ({ params }) => {
    const post = mockPosts.find(p => p.id === params.id)

    if (!post) {
      return HttpResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return HttpResponse.json(post)
  }),

  http.post('/api/posts', async ({ request }) => {
    const body = (await request.json()) as { title: string; content: string }

    const newPost = {
      id: String(mockPosts.length + 1),
      ...body,
      author: mockSession.user.name,
      createdAt: new Date().toISOString(),
      likes: 0,
    }

    mockPosts.push(newPost)
    return HttpResponse.json(newPost, { status: 201 })
  }),

  http.post('/api/posts/:id/like', ({ params }) => {
    const post = mockPosts.find(p => p.id === params.id)

    if (!post) {
      return HttpResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    post.likes += 1
    return HttpResponse.json({ success: true, likes: post.likes })
  }),

  // Payment endpoints
  http.post('/api/payments/process', async ({ request }) => {
    const body = (await request.json()) as { amount: number; orderId: string }

    // Simulate random success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (isSuccess) {
      return HttpResponse.json({
        success: true,
        orderId: body.orderId,
        amount: body.amount,
        transactionId: `txn_${Date.now()}`,
      })
    } else {
      return HttpResponse.json(
        {
          success: false,
          error: 'Payment processing failed',
          orderId: body.orderId,
        },
        { status: 400 }
      )
    }
  }),

  // Rewards endpoints
  http.get('/api/rewards', () => {
    return HttpResponse.json([
      {
        id: '1',
        userId: mockSession.user.id,
        points: 100,
        reason: 'Purchase reward',
        createdAt: new Date().toISOString(),
      },
    ])
  }),
]
