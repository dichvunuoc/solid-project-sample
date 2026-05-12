# Quick Start Guide

> **Template note:** This repository is a **Vite SPA** only (no in-repo database or Better Auth). Follow the main [README.md](../README.md) for install, env vars, and wiring your backend. Sections below that mention Prisma/Better Auth are **legacy** and kept for historical context only.

## 🚀 Initial Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Choose one:

**Prisma:**

```bash
npm install -D prisma @prisma/client
npx prisma init
```

**Drizzle:**

```bash
npm install drizzle-orm drizzle-kit pg
npm install -D @types/pg
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL="your-database-url"
BETTER_AUTH_SECRET="generate-a-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
```

### 4. Update Better Auth Configuration

Edit `src/shared/api/better-auth.ts`:

**For Prisma:**

```ts
import { prisma } from '@/shared/lib/prisma'

export const betterAuth = createBetterAuth({
  database: prismaAdapter({ prisma }),
  // ... rest of config
})
```

**For Drizzle:**

```ts
import { db } from '@/shared/lib/drizzle'

export const betterAuth = createBetterAuth({
  database: drizzleAdapter({ db }),
  // ... rest of config
})
```

### 5. Initialize Git Hooks

```bash
npm run prepare
```

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📝 Common Tasks

### Adding a New Page

1. Create page component in `src/pages/my-page/index.tsx`
2. Create route in `src/routes/my-page.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { MyPage } from '@/pages/my-page'

export const Route = createFileRoute('/my-page')({
  component: MyPage,
})
```

### Protecting a Route

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { betterAuth } from '@/shared/api/better-auth'

export const Route = createFileRoute('/protected')({
  component: ProtectedPage,
  beforeLoad: async ({ request }) => {
    const session = await betterAuth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      throw redirect({ to: '/login' })
    }
  },
})
```

### Using Session in Components

```tsx
import { useSession } from '@/entities/session/api/use-session'

function MyComponent() {
  const { data: session, isLoading } = useSession()

  if (isLoading) return <div>Loading...</div>
  if (!session) return <div>Not logged in</div>

  return <div>Hello, {session.user.email}</div>
}
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Check TypeScript types

## 📚 Next Steps

1. Read the full [README.md](./README.md) for detailed documentation
2. Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for architecture details
3. Set up your database schema
4. Configure Better Auth providers
5. Start building your features!
