# AGENTS.md

> Generic instructions for AI coding assistants working on this codebase.
> For Claude-specific guidance, see [CLAUDE.md](./CLAUDE.md).

## Project Overview

This is a **production-ready monorepo template** for building full-stack applications with:
- **Web**: Next.js 15 (App Router, React 19)
- **Mobile**: Expo 52 (React Native 0.76)
- **Backend**: tRPC + Neon (Serverless PostgreSQL) + Drizzle ORM
- **Integrations**: Clerk (Auth), Stripe (Payments), PostHog (Analytics), Sentry (Monitoring)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (React 19) |
| Mobile | Expo 52 (React Native 0.76) |
| Database | Neon + Drizzle ORM |
| Auth | Clerk |
| Payments | Stripe |
| Analytics | PostHog |
| Monitoring | Sentry |
| API | tRPC + React Query |
| i18n | next-intl (web), use-intl (mobile) |
| State | Zustand |
| Styling | Tailwind CSS |
| Package Manager | pnpm + Turborepo |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development (all apps)
pnpm dev

# Start web only
pnpm dev:web

# Start mobile only
pnpm dev:mobile

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Build all packages
pnpm build
```

## Project Structure

```
├── apps/
│   ├── web/                 # Next.js web application
│   └── mobile/              # Expo mobile app
├── packages/
│   ├── api/                 # tRPC routers and procedures
│   ├── db/                  # Drizzle schema and Neon client
│   ├── shared/              # Shared types, utils, validators
│   ├── analytics/           # PostHog wrapper (web + native)
│   ├── monitoring/          # Sentry wrapper (web + native)
│   ├── payments/            # Stripe wrapper
│   ├── i18n/                # Internationalization (next-intl + use-intl)
│   └── store/               # Zustand state management
├── tooling/
│   ├── eslint/              # Shared ESLint configs
│   └── typescript/          # Shared TypeScript configs
└── scripts/                 # Setup and provisioning scripts
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/layout.tsx` | Web root layout, defines provider hierarchy |
| `apps/web/src/app/api/trpc/[trpc]/route.ts` | tRPC API edge handler |
| `apps/mobile/App.tsx` | Mobile entry point, defines provider hierarchy |
| `packages/api/src/routers/` | tRPC router definitions |
| `packages/db/src/schema.ts` | Database schema definition (Drizzle) |
| `packages/i18n/locales/en.json` | Core translation strings (Source of Truth) |
| `packages/store/src/stores/` | Zustand store definitions |

## Architecture

### Provider Order (Web & Mobile)

```
Auth (Clerk)
  ↳ Analytics (PostHog)
    ↳ API (tRPC/React Query)
      ↳ i18n (next-intl/use-intl)
        ↳ State (Zustand)
          ↳ Application
```

### Shared Packages Pattern

Packages with platform-specific code follow this export pattern:
- `@repo/package` - Shared types and logic
- `@repo/package/web` - Web-specific implementation (Next.js)
- `@repo/package/native` - Mobile-specific implementation (Expo)

## Code Style

### TypeScript
- Strict mode enabled.
- Prefer `interface` for object shapes.
- Use string literals for enums.

### Naming Conventions
- Files: kebab-case
- Components: PascalCase
- Functions/Variables: camelCase
- Constants: SCREAMING_SNAKE_CASE

### Imports
1. React/External libraries
2. `@repo/*` workspace packages
3. `@/*` app-internal aliases
4. Relative imports

## Common Tasks

### Adding a Translation
Add key-value pairs to `packages/i18n/locales/en.json`. Use `useTranslations` from the respective `@repo/i18n` entry point.

### Adding a Zustand Store
Create a store in `packages/store/src/stores/`. Register it in the platform-specific `StoreProvider`.

### Adding an API Endpoint
Define procedures in `packages/api/src/routers/` and register in the main `appRouter`.

### Adding a Database Table
Define the table in `packages/db/src/schema.ts` and run `pnpm db:push`.

## Verification

Before completing tasks, ensure the following commands pass:
```bash
pnpm typecheck
pnpm lint
pnpm build
```
