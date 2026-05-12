/**
 * Mock Authentication Client
 * 
 * Stores users and sessions in localStorage for development/demo purposes.
 * This is a mock implementation - replace with real auth in production.
 */

interface User {
  id: string
  email: string
  name?: string
  password: string // In real app, this would be hashed
  createdAt: string
}

interface Session {
  token: string
  userId: string
  expiresAt: number
}

const USERS_KEY = 'mock_users'
const SESSION_KEY = 'mock_session'

/** Local mock auth runs in dev unless VITE_USE_MOCK_AUTH=false. Never seeds storage in production builds. */
export const isMockAuthActive =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH !== 'false'

// Initialize with a demo user
function initializeMockUsers() {
  if (typeof window === 'undefined') return

  const existing = localStorage.getItem(USERS_KEY)
  if (!existing) {
    const demoUser: User = {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      password: 'password123', // In production, this would be hashed
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([demoUser]))
  }
}

if (typeof window !== 'undefined' && isMockAuthActive) {
  initializeMockUsers()
}

function getUsers(): User[] {
  if (typeof window === 'undefined') return []
  const usersJson = localStorage.getItem(USERS_KEY)
  return usersJson ? JSON.parse(usersJson) : []
}

function saveUsers(users: User[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const sessionJson = localStorage.getItem(SESSION_KEY)
  if (!sessionJson) return null
  const session = JSON.parse(sessionJson) as Session
  if (session.expiresAt < Date.now()) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  return session
}

function saveSession(session: Session) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export const mockAuth = {
  signUp: {
    email: async (params: {
      email: string
      password: string
      name?: string
    }): Promise<{ user: User }> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const users = getUsers()

      // Check if user already exists
      if (users.some((u) => u.email === params.email)) {
        throw new Error('User with this email already exists')
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: params.email,
        name: params.name,
        password: params.password, // In production, hash this
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      saveUsers(users)

      // Auto-login after signup
      const session: Session = {
        token: `token_${Date.now()}_${Math.random()}`,
        userId: newUser.id,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }
      saveSession(session)

      return { user: newUser }
    },
  },

  signIn: {
    email: async (params: {
      email: string
      password: string
    }): Promise<{ user: User }> => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const users = getUsers()
      const user = users.find(
        (u) => u.email === params.email && u.password === params.password,
      )

      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Create session
      const session: Session = {
        token: `token_${Date.now()}_${Math.random()}`,
        userId: user.id,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }
      saveSession(session)

      return { user }
    },
  },

  signOut: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    clearSession()
  },

  getSession: async (): Promise<{
    user: User
    session: Session
  } | null> => {
    await new Promise((resolve) => setTimeout(resolve, 100))

    const session = getSession()
    if (!session) return null

    const users = getUsers()
    const user = users.find((u) => u.id === session.userId)

    if (!user) {
      clearSession()
      return null
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      } as User,
      session,
    }
  },
}

