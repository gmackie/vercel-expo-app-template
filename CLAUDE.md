# CLAUDE.md

> Instructions for Claude Code and AI assistants working on this codebase.

## Project Overview

This is a **production-ready monorepo template** for building full-stack applications with:
- **Web**: Next.js 15 (App Router, React 19)
- **Mobile**: Expo 52 (React Native 0.76)
- **Backend**: tRPC + Neon (Serverless PostgreSQL) + Drizzle ORM
- **Integrations**: Clerk (Auth), Stripe (Payments), PostHog (Analytics), Sentry (Monitoring)

The template provides pre-configured integrations for auth, payments, analytics, monitoring, i18n, and state management.

### Tech Stack

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

## Architecture

The project uses a monorepo structure managed by Turborepo and pnpm workspaces.

### Monorepo Structure

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

### Data Flow

1.  **Server State**: Managed by tRPC and React Query. Routers are defined in `packages/api`.
2.  **Database**: Drizzle ORM used to interact with Neon PostgreSQL. Schema in `packages/db`.
3.  **Client State**: Managed by Zustand in `packages/store`.
4.  **Analytics/Monitoring**: Abstracted into shared packages for consistency across web and mobile.

## Key Files

| File | Responsibility |
|------|----------------|
| `apps/web/src/app/layout.tsx` | Web root layout, defines provider hierarchy |
| `apps/web/src/app/api/trpc/[trpc]/route.ts` | tRPC API edge handler |
| `apps/mobile/App.tsx` | Mobile entry point, defines provider hierarchy |
| `packages/api/src/routers/` | tRPC router definitions |
| `packages/db/src/schema.ts` | Database schema definition (Drizzle) |
| `packages/i18n/locales/en.json` | Core translation strings (Source of Truth) |
| `packages/store/src/stores/` | Zustand store definitions |

## Code Style

### TypeScript

- **Strict Mode**: Always enabled. Avoid `any`, use `unknown` if necessary.
- **Interfaces**: Prefer `interface` over `type` for object shapes.
- **Enums**: Use string literals or `const as const` objects instead of TypeScript `enum`.

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`, `auth-provider.tsx`).
- **Components**: PascalCase (`UserProfile`, `Button`).
- **Functions/Variables**: camelCase (`getUser`, `isLoading`).
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`).

### Imports

- **Aliases**: Use `@/` for internal app imports and `@repo/` for workspace packages.
- **Order**:
    1. React and core libraries
    2. External dependencies
    3. `@repo/*` packages
    4. `@/*` internal aliases
    5. Relative imports (`./`, `../`)

### Components

- **Functional Components**: Use `export function ComponentName()` syntax.
- **Props**: Define props interface immediately above the component.
- **Hook Placement**: Keep hooks at the top of the component body.

## Environment Variables

### Core Requirements

| Variable | Description | Platform |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Backend |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Web |
| `CLERK_SECRET_KEY` | Clerk secret key | Web (Server) |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key for Expo | Mobile |

### Optional Integrations

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`
- `SENTRY_DSN` / `SENTRY_AUTH_TOKEN`

## Provider Hierarchy

Both Web and Mobile should follow this provider wrapping order:

```
Auth (Clerk)
  ↳ Analytics (PostHog)
    ↳ API (tRPC/React Query)
      ↳ i18n (next-intl/use-intl)
        ↳ State (Zustand)
          ↳ Application
```

## Common Tasks

### Adding a Translation

1. Add the key-value pair to `packages/i18n/locales/en.json`.
2. Use the `useTranslations` hook from `@repo/i18n/web` or `@repo/i18n/native`.

### Adding a Zustand Store

1. Create a new store file in `packages/store/src/stores/`.
2. Add the store to the `StoreProvider` in `packages/store/src/web.tsx` and `packages/store/src/native.tsx`.
3. Export a custom hook for the store.

### Adding an API Endpoint

1. Define the procedure in a new or existing router in `packages/api/src/routers/`.
2. Add the router to the `appRouter` in `packages/api/src/routers/index.ts`.
3. Call the endpoint using the tRPC client (`api.router.procedure.useQuery()`).

### Adding a Workspace Package

1. Create `packages/new-package/`.
2. Copy `package.json` and `tsconfig.json` from an existing package like `packages/shared`.
3. Update `package.json` name to `@repo/new-package`.
4. Run `pnpm install`.

## Claude-Specific Guidance

### Tool Preferences

- **Edit > Write**: Always prefer the `Edit` tool for modifying existing files to preserve context and minimize large rewrites.
- **LSP**: Run `lsp_diagnostics` frequently to catch type errors before they propagate.
- **Exploration**: Use `explore` agents via the `Task` tool for broad codebase understanding or finding patterns.

### Development Workflow

1.  **Discover**: Use `Grep` or `explore` to find relevant code.
2.  **Verify**: Check existing tests or run `pnpm typecheck`.
3.  **Implement**: Use `Edit` to apply changes.
4.  **Validate**: Run `pnpm typecheck` and `pnpm lint` before marking a task as complete.

### Communication

- Be concise and technical.
- If a task is ambiguous, ask for clarification before proceeding.
- When reporting completion, summarize the changes and verification results.
