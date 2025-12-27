# Neon, PostHog, and Sentry Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate PostHog (full suite with session recordings and feature flags) and Sentry (standard with source maps) into both Next.js and Expo apps, and clean up Turso references.

**Architecture:** PostHog providers wrap both apps, initializing on mount and integrating with Clerk for user identification. Sentry uses Next.js instrumentation pattern for web and Sentry.wrap() for mobile. Environment files updated to reflect Neon instead of Turso.

**Tech Stack:** PostHog JS + React Native, Sentry Next.js + React Native, Expo SDK 52

---

## Task 1: Clean Up Environment Files

**Files:**
- Modify: `apps/web/.env.example`
- Modify: `apps/mobile/.env.example`

**Step 1: Update web .env.example**

Replace the entire contents of `apps/web/.env.example`:

```
# Web app environment variables
# Copy to .env.local

# API URL (set automatically on Vercel)
VERCEL_URL=

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

**Step 2: Update mobile .env.example**

Replace the entire contents of `apps/mobile/.env.example`:

```
# =============================================================================
# Mobile App Environment Variables
# =============================================================================
# Copy to .env and fill in your values.
#
# For local development, use ./scripts/dev-mobile.sh which automatically
# sets EXPO_PUBLIC_API_URL to the ngrok tunnel URL.
# =============================================================================

# API URL
EXPO_PUBLIC_API_URL=

# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

# PostHog Analytics
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry Error Tracking
EXPO_PUBLIC_SENTRY_DSN=
```

**Step 3: Commit**

```bash
git add apps/web/.env.example apps/mobile/.env.example
git commit -m "chore: update env examples for Neon, remove Turso references"
```

---

## Task 2: Install Web Dependencies

**Files:**
- Modify: `apps/web/package.json`

**Step 1: Install PostHog and Sentry packages**

```bash
cd apps/web && pnpm add posthog-js @sentry/nextjs
```

**Step 2: Verify installation**

Run: `cd apps/web && pnpm list posthog-js @sentry/nextjs`
Expected: Both packages listed with versions

**Step 3: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore(web): add posthog-js and @sentry/nextjs dependencies"
```

---

## Task 3: Install Mobile Dependencies

**Files:**
- Modify: `apps/mobile/package.json`

**Step 1: Install PostHog and Sentry packages**

```bash
cd apps/mobile && pnpm add @sentry/react-native posthog-react-native posthog-react-native-session-replay
```

**Step 2: Verify installation**

Run: `cd apps/mobile && pnpm list @sentry/react-native posthog-react-native`
Expected: Both packages listed with versions

**Step 3: Commit**

```bash
git add apps/mobile/package.json pnpm-lock.yaml
git commit -m "chore(mobile): add sentry and posthog dependencies"
```

---

## Task 4: Create PostHog Provider for Web

**Files:**
- Create: `apps/web/src/lib/posthog/provider.tsx`
- Create: `apps/web/src/lib/posthog/pageview.tsx`
- Create: `apps/web/src/lib/posthog/index.ts`

**Step 1: Create the PostHog provider**

Create `apps/web/src/lib/posthog/provider.tsx`:

```tsx
"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { PostHogPageview } from "./pageview";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) {
      console.warn("PostHog key not configured");
      return;
    }

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: false, // We handle this manually for SPA
      capture_pageleave: true,
      autocapture: true,
      enable_recording_console_log: true,
      session_recording: {
        recordCrossOriginIframes: true,
      },
    });
  }, []);

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageview />
      <PostHogAuthWrapper>{children}</PostHogAuthWrapper>
    </PHProvider>
  );
}

function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isSignedIn && userId) {
      posthog.identify(userId, {
        email: user?.primaryEmailAddress?.emailAddress,
        name: user?.fullName,
      });
    } else if (!isSignedIn) {
      posthog.reset();
    }
  }, [isSignedIn, userId, user]);

  return <>{children}</>;
}
```

**Step 2: Create the pageview tracker**

Create `apps/web/src/lib/posthog/pageview.tsx`:

```tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

export function PostHogPageview() {
  return (
    <Suspense fallback={null}>
      <PageviewTracker />
    </Suspense>
  );
}
```

**Step 3: Create the index export**

Create `apps/web/src/lib/posthog/index.ts`:

```ts
export { PostHogProvider } from "./provider";
```

**Step 4: Verify files exist**

Run: `ls -la apps/web/src/lib/posthog/`
Expected: provider.tsx, pageview.tsx, index.ts

**Step 5: Commit**

```bash
git add apps/web/src/lib/posthog/
git commit -m "feat(web): add PostHog provider with pageview tracking and Clerk integration"
```

---

## Task 5: Integrate PostHog into Web Layout

**Files:**
- Modify: `apps/web/src/app/layout.tsx`

**Step 1: Update layout.tsx**

Replace the entire contents of `apps/web/src/app/layout.tsx`:

```tsx
import React from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/trpc/provider";
import { PostHogProvider } from "@/lib/posthog";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "Built with Next.js + Expo",
};

function Providers({ children }: { children: React.ReactNode }) {
  // Clerk requires keys at build time for static pages
  // Wrap conditionally to allow builds without keys
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <PostHogProvider>
        <TRPCProvider>{children}</TRPCProvider>
      </PostHogProvider>
    );
  }

  return (
    <ClerkProvider>
      <PostHogProvider>
        <TRPCProvider>{children}</TRPCProvider>
      </PostHogProvider>
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Step 2: Verify typecheck passes**

Run: `cd apps/web && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/web/src/app/layout.tsx
git commit -m "feat(web): integrate PostHog provider into app layout"
```

---

## Task 6: Create Sentry Config Files for Web

**Files:**
- Create: `apps/web/sentry.client.config.ts`
- Create: `apps/web/sentry.server.config.ts`
- Create: `apps/web/sentry.edge.config.ts`
- Create: `apps/web/src/instrumentation.ts`

**Step 1: Create sentry.client.config.ts**

Create `apps/web/sentry.client.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session Replay
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Only enable in production or when DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

**Step 2: Create sentry.server.config.ts**

Create `apps/web/sentry.server.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Only enable in production or when DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

**Step 3: Create sentry.edge.config.ts**

Create `apps/web/sentry.edge.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Only enable in production or when DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

**Step 4: Create instrumentation.ts**

Create `apps/web/src/instrumentation.ts`:

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = async (
  error: Error,
  request: Request,
  context: { routerKind: string; routePath: string; routeType: string }
) => {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureException(error, {
    extra: {
      url: request.url,
      method: request.method,
      ...context,
    },
  });
};
```

**Step 5: Verify files exist**

Run: `ls apps/web/sentry.*.config.ts apps/web/src/instrumentation.ts`
Expected: All 4 files listed

**Step 6: Commit**

```bash
git add apps/web/sentry.client.config.ts apps/web/sentry.server.config.ts apps/web/sentry.edge.config.ts apps/web/src/instrumentation.ts
git commit -m "feat(web): add Sentry configuration files and instrumentation"
```

---

## Task 7: Update Next.js Config for Sentry

**Files:**
- Modify: `apps/web/next.config.ts`

**Step 1: Update next.config.ts**

Replace the entire contents of `apps/web/next.config.ts`:

```ts
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/api", "@repo/db", "@repo/shared"],
  serverExternalPackages: ["@neondatabase/serverless"],
};

// Sentry configuration for source maps and error tracking
const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production builds
  silent: !process.env.CI,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Hide source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically instrument API routes
  autoInstrumentServerFunctions: true,

  // Automatically instrument middleware
  autoInstrumentMiddleware: true,

  // Automatically instrument app router
  autoInstrumentAppDirectory: true,
};

// Wrap with Sentry only if DSN is configured
const exportedConfig = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;

export default exportedConfig;
```

**Step 2: Verify typecheck passes**

Run: `cd apps/web && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/web/next.config.ts
git commit -m "feat(web): wrap next.config with Sentry for source maps"
```

---

## Task 8: Create PostHog Provider for Mobile

**Files:**
- Create: `apps/mobile/src/lib/posthog.tsx`

**Step 1: Create PostHog provider**

Create `apps/mobile/src/lib/posthog.tsx`:

```tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import PostHog from "posthog-react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";

type PostHogContextType = {
  posthog: PostHog | null;
};

const PostHogContext = createContext<PostHogContextType>({ posthog: null });

export function usePostHog() {
  return useContext(PostHogContext);
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [posthog, setPostHog] = useState<PostHog | null>(null);
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
    if (!key) {
      console.warn("PostHog key not configured");
      return;
    }

    const client = new PostHog(key, {
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      enableSessionReplay: true,
      sessionReplayConfig: {
        maskAllTextInputs: true,
        maskAllImages: false,
      },
    });

    setPostHog(client);

    return () => {
      client.shutdown();
    };
  }, []);

  // Identify user when auth state changes
  useEffect(() => {
    if (!posthog) return;

    if (isSignedIn && userId) {
      posthog.identify(userId, {
        email: user?.primaryEmailAddress?.emailAddress,
        name: user?.fullName,
      });
    } else if (!isSignedIn) {
      posthog.reset();
    }
  }, [posthog, isSignedIn, userId, user]);

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  );
}
```

**Step 2: Verify file exists**

Run: `ls apps/mobile/src/lib/posthog.tsx`
Expected: File listed

**Step 3: Commit**

```bash
git add apps/mobile/src/lib/posthog.tsx
git commit -m "feat(mobile): add PostHog provider with session replay and Clerk integration"
```

---

## Task 9: Integrate PostHog and Sentry into Mobile App

**Files:**
- Modify: `apps/mobile/App.tsx`

**Step 1: Update App.tsx**

Replace the entire contents of `apps/mobile/App.tsx`:

```tsx
import * as Sentry from "@sentry/react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/lib/auth";
import { TRPCProvider } from "./src/lib/trpc";
import { PostHogProvider } from "./src/lib/posthog";

// Initialize Sentry before anything else
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  attachScreenshot: true,
  attachViewHierarchy: true,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
});

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My App</Text>
      <Text style={styles.subtitle}>Built with Expo + tRPC</Text>
      <StatusBar style="auto" />
    </View>
  );
}

function App() {
  return (
    <AuthProvider>
      <PostHogProvider>
        <TRPCProvider>
          <HomeScreen />
        </TRPCProvider>
      </PostHogProvider>
    </AuthProvider>
  );
}

export default Sentry.wrap(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
```

**Step 2: Verify typecheck passes**

Run: `cd apps/mobile && pnpm typecheck`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/mobile/App.tsx
git commit -m "feat(mobile): integrate PostHog and Sentry into app"
```

---

## Task 10: Update Mobile App Config for Sentry

**Files:**
- Modify: `apps/mobile/app.config.js`

**Step 1: Update app.config.js**

Replace the entire contents of `apps/mobile/app.config.js`:

```js
const IS_DEV = process.env.APP_VARIANT === "development";

// =============================================================================
// App Configuration
// =============================================================================
// This template supports three environments:
//
// 1. Local Development (Expo Go or dev client)
//    - Uses ngrok tunnel for API access
//    - Run with: pnpm dev:mobile (from root) or ./scripts/dev-mobile.sh
//
// 2. Beta/Internal (EAS Development build)
//    - Uses internal distribution with ad-hoc signing
//    - Separate bundle ID (*.dev) for side-by-side install
//    - Build with: eas build --profile development --platform ios
//
// 3. Production (EAS Production build)
//    - For App Store / Play Store submission
//    - Build with: eas build --profile production --platform all
// =============================================================================

// =============================================================================
// TODO: Update these values for your app after running ./scripts/setup.sh
// =============================================================================
const APP_NAME = "My App";
const APP_SLUG = "my-app";
const BUNDLE_ID_BASE = "com.example.myapp"; // e.g., "com.yourcompany.yourapp"
const PROJECT_ID = "your-eas-project-id"; // Run: eas init
const OWNER = "your-expo-username"; // Your Expo username

export default {
  expo: {
    // App name - shows as "AppName-Dev" for development builds
    name: IS_DEV ? `${APP_NAME} Dev` : APP_NAME,
    slug: APP_SLUG,
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    scheme: IS_DEV ? `${APP_SLUG}-dev` : APP_SLUG,
    newArchEnabled: true,

    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    assetBundlePatterns: ["**/*"],

    ios: {
      supportsTablet: true,
      // Different bundle ID for dev allows side-by-side installation
      bundleIdentifier: IS_DEV ? `${BUNDLE_ID_BASE}.dev` : BUNDLE_ID_BASE,
      buildNumber: "1",
      infoPlist: {
        // Add any required permissions here
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      // Different package name for dev allows side-by-side installation
      package: IS_DEV ? `${BUNDLE_ID_BASE}.dev` : BUNDLE_ID_BASE,
      versionCode: 1,
    },

    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },

    plugins: [
      "expo-splash-screen",
      [
        "@sentry/react-native/expo",
        {
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
        },
      ],
    ],

    extra: {
      eas: {
        projectId: PROJECT_ID,
      },
      // Environment indicator for debugging
      appVariant: process.env.APP_VARIANT ?? "production",
    },

    owner: OWNER,

    // EAS Update configuration
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: `https://u.expo.dev/${PROJECT_ID}`,
    },
  },
};
```

**Step 2: Commit**

```bash
git add apps/mobile/app.config.js
git commit -m "feat(mobile): add Sentry expo plugin to app config"
```

---

## Task 11: Verify Builds

**Step 1: Verify web build**

Run: `cd apps/web && pnpm build`
Expected: Build completes successfully (warnings about missing env vars are OK)

**Step 2: Verify mobile typecheck**

Run: `cd apps/mobile && pnpm typecheck`
Expected: No errors

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: integration complete" --allow-empty
```

---

## Summary

After completing all tasks:

1. **PostHog** is integrated in both apps with:
   - Auto-capture and session recordings
   - Feature flags support (client-side)
   - Automatic user identification via Clerk
   - SPA pageview tracking (web)

2. **Sentry** is integrated in both apps with:
   - Error tracking and performance monitoring
   - Source maps upload (web)
   - Session replay on errors (web)
   - Native crash reporting (mobile, requires EAS build)

3. **Environment files** updated to use Neon, Turso references removed
