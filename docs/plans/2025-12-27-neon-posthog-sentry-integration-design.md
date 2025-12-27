# Neon, PostHog, and Sentry Integration Design

## Overview

Integrate PostHog (full suite) and Sentry (standard) into both Next.js and Expo apps, and clean up Turso references in favor of existing Neon setup.

## Decisions

- **PostHog**: Full suite - auto-capture, session recordings, feature flags (client-side only)
- **Sentry**: Standard - error tracking, performance tracing, source maps upload
- **Neon**: Keep current setup, just clean up Turso env var references
- **Next.js Sentry**: Wizard-style with separate config files for client/server/edge

## PostHog Integration

### Web (`apps/web`)

Create PostHog provider with SPA pageview tracking:

```
apps/web/src/lib/posthog/
  provider.tsx      # PostHogProvider with init config
  pageview.tsx      # usePathname-based pageview tracker
```

Configuration:
```typescript
posthog.init(key, {
  api_host: "https://us.i.posthog.com",
  capture_pageview: false,        // Manual SPA tracking
  capture_pageleave: true,
  autocapture: true,
  enable_recording_console_log: true,
  session_recording: { recordCrossOriginIframes: true },
})
```

Wrap app in `layout.tsx` with `PostHogProvider`.

### Mobile (`apps/mobile`)

Create PostHog provider with session replay:

```
apps/mobile/src/lib/posthog.tsx   # PostHogProvider + init
```

Configuration:
```typescript
const client = new PostHog(key, {
  host: "https://us.i.posthog.com",
  enableSessionReplay: true,
  sessionReplayConfig: {
    maskAllTextInputs: true,
    maskAllImages: false,
  },
})
```

Wrap app in `App.tsx` with `PostHogProvider`.

## Sentry Integration

### Web (`apps/web`)

Use Next.js App Router instrumentation pattern with separate config files:

```
apps/web/
  sentry.client.config.ts    # Browser-side init
  sentry.server.config.ts    # Node.js server init  
  sentry.edge.config.ts      # Edge runtime init
  src/instrumentation.ts     # Next.js instrumentation hook
  next.config.ts             # Wrap with withSentryConfig
```

Configuration:
```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  integrations: [
    Sentry.replayIntegration(),
  ],
  replaysSessionSampleRate: 0.1,   // 10% of sessions
  replaysOnErrorSampleRate: 1.0,   // 100% when errors occur
})
```

Source maps uploaded automatically during `next build` via auth token.

### Mobile (`apps/mobile`)

Initialize Sentry early and wrap root component:

```typescript
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  attachScreenshot: true,
  attachViewHierarchy: true,
})

export default Sentry.wrap(App)
```

Update `app.config.js` with Sentry plugin config.

Note: Full native crash reporting requires `eas build` - Expo Go has limited support.

## Environment Variables

### Web (`apps/web/.env.example`)

```
# Database (Neon)
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

### Mobile (`apps/mobile/.env.example`)

```
# API
EXPO_PUBLIC_API_URL=

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

# PostHog
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry
EXPO_PUBLIC_SENTRY_DSN=
```

## Package Dependencies

### Web (`apps/web/package.json`)

```json
"@sentry/nextjs": "^8"
"posthog-js": "^1"
```

### Mobile (`apps/mobile/package.json`)

```json
"@sentry/react-native": "^5"
"posthog-react-native": "^3"
"posthog-react-native-session-replay": "^1"
```

## Implementation Order

1. Update environment variable files (cleanup Turso)
2. Install dependencies in both apps
3. Set up PostHog in web app
4. Set up PostHog in mobile app
5. Set up Sentry in web app (config files + next.config wrapper)
6. Set up Sentry in mobile app
7. Test both apps build successfully
