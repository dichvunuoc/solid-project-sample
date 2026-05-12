# Project Documentation Index

**Project:** frontend-sample  
**Type:** Monolith Web Application  
**Architecture:** Feature-Sliced Design (FSD)  
**Documentation Generated:** 2025-12-31  
**Scan Level:** Deep

---

## 📋 Project Overview

**frontend-sample** is a production-ready React 18 web application built with TanStack Start and organized using Feature-Sliced Design architecture. The project demonstrates enterprise-grade patterns including authentication, state management, event-driven architecture, and comprehensive testing.

### Quick Reference

- **Primary Language:** TypeScript 5.5.3
- **Framework:** React 18.3.1 + TanStack Start 1.144.0
- **Build Tool:** Vite 5.4.11
- **Architecture Pattern:** Feature-Sliced Design (FSD)
- **Database:** Prisma 7.2.0 + SQLite
- **Testing:** Vitest + Playwright + MSW
- **UI:** Shadcn UI + Tailwind CSS 3.4.4

### Tech Stack Summary

| Category         | Technology               | Version         |
| ---------------- | ------------------------ | --------------- |
| Meta-Framework   | TanStack Start           | 1.144.0         |
| UI Library       | React                    | 18.3.1          |
| Language         | TypeScript               | 5.5.3           |
| Routing          | TanStack Router          | 1.144.0         |
| State Management | TanStack Query + Zustand | 5.90.14 + 4.5.0 |
| Authentication   | Better Auth              | 1.4.9           |
| Database ORM     | Prisma                   | 7.2.0           |
| Styling          | Tailwind CSS             | 3.4.4           |
| UI Components    | Shadcn UI + Radix UI     | Latest          |
| Forms            | React Hook Form + Zod    | 7.69.0 + 4.3.2  |
| Testing (Unit)   | Vitest                   | 1.0.4           |
| Testing (E2E)    | Playwright               | Latest          |
| Error Monitoring | Sentry                   | 10.32.1         |

---

## 🗂️ Generated Documentation

### Core Architecture Analysis

#### [Architectural Strictness Analysis](./architectural-strictness-analysis.md) ⭐ **USER FOCUS**

**Comprehensive FSD compliance audit and architectural best practices**

- Layer boundary analysis (99.2% compliant)
- Import dependency validation
- FSD public API pattern compliance
- Cross-slice communication patterns
- Architectural violation detection (1 minor issue found)
- Refactoring recommendations
- ESLint automation suggestions

**Key Findings:**

- ✅ 9.5/10 architectural compliance score
- ✅ Strict layer hierarchy (only 1 violation in entire codebase)
- ✅ Proper public API exports via index.ts
- ✅ Event-driven feature decoupling
- ⚠️ Single upward dependency in `use-permission.ts` (fixable)

**30+ pages of detailed analysis**

---

### API & Integration

#### [API Contracts & Integration Patterns](./api-contracts.md)

**Complete API documentation and integration strategies**

- HTTP client configuration and patterns
- Authentication API (Better Auth mock)
- Entity query patterns (TanStack Query)
- Feature mutation patterns
- Query key strategy
- Event-driven API integration
- Error handling patterns
- API mocking with MSW
- Migration guide to production

---

### Data Layer

#### [Data Models & Schema](./data-models.md)

**Database schema, ORM patterns, and type definitions**

- Prisma schema documentation
- User, Account, Session, Verification models
- Entity relationship diagrams
- TypeScript type definitions
- Data access patterns
- Validation schemas (Zod)
- Migration strategy
- Future schema extensions

---

### State Management

#### [State Management Patterns](./state-management-patterns.md)

**Multi-layered state architecture**

- TanStack Query (server state)
- Zustand stores (client state)
- Event Bus (cross-feature communication)
- Local React state guidelines
- Query key factory
- Optimistic updates
- Cache invalidation patterns
- Performance optimizations
- Testing strategies

**State Categories:**

- 🔵 Server State → TanStack Query
- 🟢 Global Client State → Zustand
- 🟡 Cross-Feature → Event Bus
- 🟠 Local → React useState

---

### UI Components

#### [UI Component Inventory](./ui-component-inventory.md)

**Complete component library catalog**

- 42 production-ready components
- Shadcn UI components (27 installed)
- Custom form components (6)
- Entity-specific components (3)
- Feature components (3)
- Utility components (3)
- Styling patterns and best practices
- Accessibility features
- Component testing examples

---

## 📚 Existing Documentation

### Getting Started

- [**README.md**](../README.md) - Main project documentation
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [QUICK_REFERENCE_GUIDE.md](./QUICK_REFERENCE_GUIDE.md) - Quick reference
- [**IMPLEMENTATION_GUIDE.md**](./IMPLEMENTATION_GUIDE.md) ⭐ **NEW** - Complete guide to implement features using all utilities

### Architecture & Patterns

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Detailed FSD structure
- [EVENT_BUS_GUIDE.md](./EVENT_BUS_GUIDE.md) - Event-driven architecture
- [CLASS_BASED_EVENTS_GUIDE.md](./CLASS_BASED_EVENTS_GUIDE.md) - Class-based events

### Contributing

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

---

## 🎯 Project Structure

```
frontend-sample/
├── src/
│   ├── app/              # Application layer
│   │   ├── providers.tsx        # Global providers
│   │   ├── middleware.ts        # Auth middleware
│   │   └── root.tsx             # Root component
│   ├── pages/            # Pages layer
│   │   ├── home/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── dashboard/
│   ├── widgets/          # Widgets layer (reserved)
│   ├── features/         # Features layer
│   │   ├── auth/
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── dashboard-sync/
│   │   ├── process-payment/
│   │   └── process-rewards/
│   ├── entities/         # Entities layer
│   │   ├── finance/
│   │   ├── post/
│   │   └── session/
│   └── shared/           # Shared layer
│       ├── api/          # HTTP clients, event bus
│       ├── lib/          # Utilities, hooks, stores
│       ├── ui/           # Component library
│       └── config/       # Configuration
├── docs/                 # Documentation
├── e2e/                  # E2E tests (Playwright)
├── prisma/               # Database schema
└── dist/                 # Build output
```

---

## 🔑 Key Features

### Authentication & Authorization

- ✅ Better Auth integration (mock mode ready for production)
- ✅ Session management with Prisma
- ✅ RBAC system (Admin, Moderator, User, Guest)
- ✅ Route protection with TanStack Router
- ✅ Permission hooks for component-level security

### State Management

- ✅ TanStack Query for server state
- ✅ Zustand for global client state
- ✅ Event bus for feature decoupling
- ✅ Optimistic updates
- ✅ Cache invalidation strategies

### UI & Styling

- ✅ Shadcn UI component library (42 components)
- ✅ Tailwind CSS with custom theme
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Accessibility (WCAG 2.1 AA)

### Testing

- ✅ Unit tests with Vitest
- ✅ E2E tests with Playwright
- ✅ API mocking with MSW
- ✅ Component tests with Testing Library

### Developer Experience

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Husky + lint-staged
- ✅ Bundle analysis (rollup-plugin-visualizer)
- ✅ TanStack Query DevTools
- ✅ Zustand DevTools

### Production Features

- ✅ Sentry error monitoring
- ✅ Web Vitals tracking
- ✅ Feature flags system
- ✅ Modal manager
- ✅ Pagination utilities

---

## 📊 Architecture Assessment

### FSD Compliance Score: **9.5/10** ⭐

**Strengths:**

- ✅ Near-perfect layer boundary adherence (99.2%)
- ✅ Proper public API pattern (98%)
- ✅ Event-driven feature communication
- ✅ Clean separation of concerns
- ✅ Type-safe throughout

**Minor Issues:**

- ⚠️ 1 upward dependency violation (`use-permission.ts`)
- ⚠️ 1 missing `index.ts` (entities/session)

**Detailed analysis available in:** [Architectural Strictness Analysis](./architectural-strictness-analysis.md)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (or Bun)
- npm/pnpm/yarn/bun

### Installation

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
```

---

## 🎓 Learning Resources

### Understanding FSD Architecture

1. Start with [Project Structure](./PROJECT_STRUCTURE.md)
2. Read [Architectural Strictness Analysis](./architectural-strictness-analysis.md)
3. Review [Event Bus Guide](./EVENT_BUS_GUIDE.md)
4. Check [State Management Patterns](./state-management-patterns.md)

### Development Workflow

1. Review [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Understand [API Contracts](./api-contracts.md)
3. Study [UI Component Inventory](./ui-component-inventory.md)
4. Check [Data Models](./data-models.md)

---

## 🔍 Documentation Quick Links

### By Topic

**Architecture:**

- [Architectural Strictness Analysis](./architectural-strictness-analysis.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Event Bus Guide](./EVENT_BUS_GUIDE.md)

**Development:**

- [**Implementation Guide**](./IMPLEMENTATION_GUIDE.md) ⭐ **Start Here for Feature Development**
- [API Contracts](./api-contracts.md)
- [Data Models](./data-models.md)
- [State Management](./state-management-patterns.md)
- [UI Components](./ui-component-inventory.md)

**Getting Started:**

- [README](../README.md)
- [Quick Start](./QUICK_START.md)
- [Quick Reference](./QUICK_REFERENCE_GUIDE.md)
- [Contributing](./CONTRIBUTING.md)

---

## 📈 Project Statistics

| Metric                  | Value                                                      |
| ----------------------- | ---------------------------------------------------------- |
| **Total Components**    | 42                                                         |
| **FSD Layers**          | 5 (app, pages, features, entities, shared)                 |
| **Features**            | 4 (auth, dashboard-sync, process-payment, process-rewards) |
| **Entities**            | 3 (finance, post, session)                                 |
| **Database Models**     | 4 (User, Account, Session, Verification)                   |
| **Event Types**         | 5 (payment, post, reward, user, notification)              |
| **Zustand Stores**      | 2 (theme, modal)                                           |
| **Test Files**          | 2 E2E + Unit tests                                         |
| **Documentation Files** | 13+                                                        |

---

## 🎯 Next Steps

### For New Developers

1. **Read this index** to understand the project
2. **Review [Architectural Strictness Analysis](./architectural-strictness-analysis.md)** to understand FSD
3. **Check [Quick Start](./QUICK_START.md)** to set up locally
4. **Review [Contributing Guide](./CONTRIBUTING.md)** before making changes

### For Feature Development

1. **📖 Read the Implementation Guide** - [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - **Complete walkthrough**
2. **Understand FSD layers** - Read [Project Structure](./PROJECT_STRUCTURE.md)
3. **Review state patterns** - Check [State Management](./state-management-patterns.md)
4. **Use the component library** - See [UI Component Inventory](./ui-component-inventory.md)
5. **Follow API patterns** - Reference [API Contracts](./api-contracts.md)

### For Code Review

1. **Check FSD compliance** - Use [Architectural Strictness Analysis](./architectural-strictness-analysis.md) as reference
2. **Verify import rules** - No upward dependencies
3. **Ensure public APIs** - Features/entities expose via `index.ts`
4. **Test coverage** - Unit + E2E tests included

---

## 🐛 Known Issues

### Minor Architectural Issues

1. **Upward dependency in `use-permission.ts`**
   - **Location:** `src/shared/lib/hooks/use-permission.ts`
   - **Issue:** Imports from entities layer
   - **Severity:** Low
   - **Fix:** See recommendations in [Architectural Strictness Analysis](./architectural-strictness-analysis.md)

2. **Missing index.ts in entities/session**
   - **Location:** `src/entities/session/`
   - **Issue:** No barrel export file
   - **Severity:** Very Low
   - **Fix:** Add `index.ts` with public API exports

---

## 📝 Documentation Maintenance

### Updating Documentation

When making significant changes to the codebase:

1. **Architecture Changes** → Update [Architectural Strictness Analysis](./architectural-strictness-analysis.md)
2. **API Changes** → Update [API Contracts](./api-contracts.md)
3. **Database Changes** → Update [Data Models](./data-models.md)
4. **State Changes** → Update [State Management](./state-management-patterns.md)
5. **UI Changes** → Update [UI Component Inventory](./ui-component-inventory.md)

### Re-running Documentation Scan

To regenerate this documentation:

```bash
# Start a new chat with the analyst agent
@analyst
# Select: [DP] Document your existing project
# Choose scan level: Deep
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

**Quick Guidelines:**

- ✅ Follow FSD layer rules (no upward dependencies)
- ✅ Use public API exports (`index.ts`)
- ✅ Write tests for new features
- ✅ Update documentation for significant changes
- ✅ Run linting and type checking before committing

---

## 📞 Support

For questions or issues:

1. Check this documentation index
2. Review relevant documentation files
3. Check existing docs in [README.md](../README.md)
4. Create an issue with detailed information

---

**Documentation Version:** 1.0.0  
**Last Updated:** 2025-12-31  
**Generated By:** BMAD Document Project Workflow (Deep Scan)

---

**⭐ This is your primary entry point for AI-assisted development. Reference this index when working with AI tools to provide comprehensive context about the project architecture and patterns.**
