# Project Structure Tree

```
frontend-sample/
│
├── .husky/
│   └── pre-commit                    # Git hook: runs lint-staged before commits
│
├── src/
│   │
│   ├── app/                          # 🎯 APP LAYER - Application initialization
│   │   ├── middleware.ts            # Auth middleware for route protection
│   │   ├── providers.tsx            # Global providers (QueryClient, etc.)
│   │   ├── root.tsx                 # Root component exports
│   │   ├── app.css                  # Global styles (Tailwind imports)
│   │   └── types.ts                 # TypeScript type definitions
│   │
│   ├── app.tsx                       # Main application entry point
│   │
│   ├── pages/                        # 📄 PAGES LAYER - Full page components
│   │   ├── home/
│   │   │   └── index.tsx            # Home page component
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── index.tsx        # Login page component
│   │   └── dashboard/
│   │       └── index.tsx            # Dashboard page (protected)
│   │
│   ├── widgets/                      # 🧩 WIDGETS LAYER - Complex UI blocks
│   │   └── (empty - add as needed)  # Example: header, sidebar, footer
│   │
│   ├── features/                     # ⚡ FEATURES LAYER - User interactions
│   │   └── auth/
│   │       └── sign-in/
│   │           └── ui/
│   │               └── sign-in-form.tsx  # Sign-in feature component
│   │
│   ├── entities/                     # 🏛️ ENTITIES LAYER - Business entities
│   │   └── session/
│   │       ├── api/
│   │       │   └── use-session.ts   # Session API hook (TanStack Query)
│   │       └── ui/
│   │           └── session-provider.tsx  # Session provider component
│   │
│   ├── shared/                       # 🔧 SHARED LAYER - Reusable code
│   │   ├── api/
│   │   │   ├── auth.ts              # Auth API exports
│   │   │   └── better-auth.ts       # Better Auth server configuration
│   │   └── lib/
│   │       ├── client-auth.ts       # Client-side auth client
│   │       ├── prisma.ts            # Prisma client setup (example)
│   │       └── drizzle.ts           # Drizzle client setup (example)
│   │
│   └── routes/                       # 🗺️ TANSTACK ROUTER - File-based routes
│       ├── __root.tsx                # Root route
│       ├── index.tsx                 # / → pages/home
│       ├── login.tsx                 # /login → pages/auth/login
│       ├── dashboard.tsx             # /dashboard → pages/dashboard
│       └── api/
│           └── auth/
│               └── $.ts              # /api/auth/* → Better Auth handler
│
├── app.config.ts                     # TanStack Start configuration
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.node.json                # TypeScript config for Node files
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc.json                  # Prettier configuration
├── .prettierignore                   # Prettier ignore patterns
├── .gitignore                        # Git ignore patterns
├── README.md                         # Comprehensive project documentation
└── PROJECT_STRUCTURE.md              # This file
```

## FSD Layer Responsibilities

### 🎯 app/

- Application initialization
- Global providers (QueryClient, Theme, etc.)
- Middleware definitions
- Root components
- Global styles

### 📄 pages/

- Full page components
- Route entry points
- Composes widgets and features
- Page-specific layouts

### 🧩 widgets/

- Complex UI blocks
- Composed of multiple features/entities
- Examples: Header, Sidebar, Footer, Dashboard Layout

### ⚡ features/

- User interactions
- Business features
- Examples: Sign-in, Create Post, Add to Cart

### 🏛️ entities/

- Business entities
- Data models and their UI
- Examples: User, Session, Post, Product

### 🔧 shared/

- Reusable utilities
- UI kit components
- API clients
- Configuration files
- Helper functions

## TanStack Router Mapping

Each file in `src/routes/` corresponds to a URL path and imports a component from `src/pages/`:

| Route File             | URL Path      | Page Component               |
| ---------------------- | ------------- | ---------------------------- |
| `routes/index.tsx`     | `/`           | `pages/home/index.tsx`       |
| `routes/login.tsx`     | `/login`      | `pages/auth/login/index.tsx` |
| `routes/dashboard.tsx` | `/dashboard`  | `pages/dashboard/index.tsx`  |
| `routes/api/auth/$.ts` | `/api/auth/*` | Better Auth handler          |

## Key Files

### Authentication

- `src/shared/api/better-auth.ts` - Server-side Better Auth config
- `src/shared/lib/client-auth.ts` - Client-side auth client
- `src/routes/api/auth/$.ts` - Auth API endpoint handler
- `src/app/middleware.ts` - Route protection middleware

### Git Hooks

- `.husky/pre-commit` - Runs lint-staged before commits
- `package.json` (lint-staged config) - Defines what to lint/format

### Configuration

- `app.config.ts` - TanStack Start config with path aliases
- `tsconfig.json` - TypeScript config with FSD path aliases
- `tailwind.config.ts` - Tailwind CSS configuration
