# Next.js + Expo Turborepo Monorepo Design

## Overview

A Turborepo monorepo with Next.js (web) and Expo (mobile) apps sharing a tRPC backend, with Supabase, Clerk, Stripe, PostHog, and Sentry integrations.

## Project Structure

```
/
├── apps/
│   ├── web/                 # Next.js 14+ (App Router)
│   └── mobile/              # Expo (SDK 50+)
├── packages/
│   ├── api/                 # tRPC routers + React Query hooks
│   ├── db/                  # Supabase client, schemas, types
│   ├── shared/              # Zod validators, shared types, utils
│   ├── analytics/           # PostHog (web + mobile wrappers)
│   ├── monitoring/          # Sentry (web + mobile configs)
│   └── payments/            # Stripe (server + client utilities)
├── tooling/
│   ├── eslint/              # Shared ESLint config
│   └── typescript/          # Shared tsconfig bases
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Architecture Decisions

### tRPC + TanStack Query

- tRPC routers live in `packages/api`
- Next.js API routes expose tRPC at `/api/trpc/[trpc]`
- Both web and mobile consume via React Query hooks from `packages/api`
- Expo calls the deployed Next.js API over HTTP

### Authentication (Clerk)

| Platform | Package | Token Transport |
|----------|---------|-----------------|
| Next.js | `@clerk/nextjs` | Cookies (automatic) |
| Expo | `@clerk/clerk-expo` | Bearer token (manual) |

The tRPC context handles both auth methods:

```typescript
export const createContext = async ({ req }) => {
  // Try cookie-based auth first (Next.js)
  let userId = getAuth(req)?.userId;

  // Fall back to Bearer token (Expo)
  if (!userId) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const verified = await clerkClient.verifyToken(token);
      userId = verified.sub;
    }
  }

  return { userId, db: supabase };
};
```

### Database (Supabase)

- Single Supabase client in `packages/db`
- Row Level Security (RLS) uses Clerk userId
- Both apps import from `@repo/db`, never instantiate their own client

### Payments (Stripe)

- Server SDK in `packages/payments` for creating sessions/webhooks
- Web uses `@stripe/react-stripe-js` for Checkout
- Mobile redirects to web-based Stripe Checkout (avoids App Store fees)

### Analytics (PostHog)

- `posthog-js` for web
- `posthog-react-native` for mobile
- Shared event types in the package
- Both identify users with Clerk userId

### Error Monitoring (Sentry)

- `@sentry/nextjs` for web
- `@sentry/react-native` for mobile
- Errors linked to Clerk userId

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_KEY=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

## Deployment

- **Next.js** → Vercel (Git integration)
- **Expo** → EAS Build + EAS Submit
- All other services are managed (Supabase, Clerk, Stripe, PostHog, Sentry)

## Package Manager

pnpm with Turborepo for build orchestration.
