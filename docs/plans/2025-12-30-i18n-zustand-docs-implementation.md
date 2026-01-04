# i18n, Zustand & AI Documentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add internationalization (i18n), client state management (Zustand), and AI assistant documentation to the monorepo template.

**Architecture:** Two new shared packages (`packages/i18n`, `packages/store`) following the existing `./web` and `./native` export pattern. Root-level CLAUDE.md and AGENTS.md for AI assistant onboarding.

**Tech Stack:** next-intl, use-intl, expo-localization, zustand, @react-native-async-storage/async-storage

**Design Doc:** `docs/plans/2025-12-30-i18n-zustand-docs-design.md`

---

## Task 1: Create packages/i18n Package Structure

**Files:**
- Create: `packages/i18n/package.json`
- Create: `packages/i18n/tsconfig.json`
- Create: `packages/i18n/locales/en.json`
- Create: `packages/i18n/src/index.ts`
- Create: `packages/i18n/src/web.ts`
- Create: `packages/i18n/src/native.tsx`

**Step 1: Create package.json**

```json
{
  "name": "@repo/i18n",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./web": {
      "types": "./src/web.ts",
      "default": "./src/web.ts"
    },
    "./native": {
      "types": "./src/native.tsx",
      "default": "./src/native.tsx"
    },
    "./messages/en": {
      "types": "./locales/en.json",
      "default": "./locales/en.json"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "next-intl": "^3.25.3",
    "use-intl": "^3.25.3"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.10.5",
    "typescript": "^5.7.2"
  },
  "peerDependencies": {
    "expo-localization": ">=15.0.0",
    "react": "^18.0.0 || ^19.0.0"
  },
  "peerDependenciesMeta": {
    "expo-localization": {
      "optional": true
    }
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "resolveJsonModule": true
  },
  "include": ["src", "locales"],
  "exclude": ["node_modules"]
}
```

**Step 3: Create locales/en.json**

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again",
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back",
    "next": "Next"
  },
  "auth": {
    "signIn": "Sign in",
    "signOut": "Sign out",
    "signUp": "Sign up",
    "forgotPassword": "Forgot password?",
    "resetPassword": "Reset password"
  },
  "home": {
    "title": "Welcome",
    "subtitle": "Built with Next.js + Expo"
  },
  "errors": {
    "notFound": "Page not found",
    "unauthorized": "You must be signed in to view this page",
    "serverError": "An unexpected error occurred"
  }
}
```

**Step 4: Create src/index.ts**

```typescript
import type en from "../locales/en.json";

// Type for all messages
export type Messages = typeof en;

// Supported locales
export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];

// Default locale (fallback)
export const defaultLocale: Locale = "en";

// Check if a locale is supported
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get the best matching locale
export function resolveLocale(requested: string | null | undefined): Locale {
  if (!requested) return defaultLocale;
  
  // Exact match
  if (isValidLocale(requested)) return requested;
  
  // Language code match (e.g., "en-US" -> "en")
  const languageCode = requested.split("-")[0];
  if (languageCode && isValidLocale(languageCode)) return languageCode;
  
  return defaultLocale;
}
```

**Step 5: Create src/web.ts**

```typescript
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, resolveLocale } from "./index";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = resolveLocale(requested);

  let messages;
  try {
    messages = (await import(`../locales/${locale}.json`)).default;
  } catch {
    // Fallback to English if locale file doesn't exist
    messages = (await import("../locales/en.json")).default;
  }

  return {
    locale,
    messages,
  };
});

// Re-export next-intl utilities for convenience
export {
  useTranslations,
  useLocale,
  useMessages,
  useNow,
  useTimeZone,
  useFormatter,
  NextIntlClientProvider,
} from "next-intl";

export { getTranslations, getLocale, getMessages } from "next-intl/server";
```

**Step 6: Create src/native.tsx**

```typescript
import React, { type ReactNode } from "react";
import { IntlProvider as UseIntlProvider } from "use-intl";
import { defaultLocale, resolveLocale, type Locale } from "./index";
import en from "../locales/en.json";

// Message loader with fallback
function loadMessages(locale: Locale): typeof en {
  // For now, only English is bundled
  // Add more locales here as they're added to locales/
  switch (locale) {
    case "en":
    default:
      return en;
  }
}

// Detect device locale (requires expo-localization as peer dep)
export function getDeviceLocale(): Locale {
  try {
    // Dynamic import to avoid requiring expo-localization when not available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getLocales } = require("expo-localization");
    const deviceLocale = getLocales()[0]?.languageCode;
    return resolveLocale(deviceLocale);
  } catch {
    return defaultLocale;
  }
}

interface I18nProviderProps {
  children: ReactNode;
  locale?: Locale;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const resolvedLocale = locale ?? getDeviceLocale();
  const messages = loadMessages(resolvedLocale);

  return (
    <UseIntlProvider locale={resolvedLocale} messages={messages}>
      {children}
    </UseIntlProvider>
  );
}

// Re-export use-intl hooks
export {
  useTranslations,
  useLocale,
  useMessages,
  useNow,
  useTimeZone,
  useFormatter,
} from "use-intl";
```

**Step 7: Run pnpm install**

Run: `pnpm install`
Expected: Dependencies installed, no errors

**Step 8: Verify types**

Run: `pnpm --filter @repo/i18n typecheck`
Expected: No type errors

**Step 9: Commit**

```bash
git add packages/i18n
git commit -m "feat(i18n): add i18n package with next-intl and use-intl"
```

---

## Task 2: Create packages/store Package Structure

**Files:**
- Create: `packages/store/package.json`
- Create: `packages/store/tsconfig.json`
- Create: `packages/store/src/index.ts`
- Create: `packages/store/src/stores/ui.ts`
- Create: `packages/store/src/stores/preferences.ts`
- Create: `packages/store/src/web.tsx`
- Create: `packages/store/src/native.tsx`

**Step 1: Create package.json**

```json
{
  "name": "@repo/store",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./web": {
      "types": "./src/web.tsx",
      "default": "./src/web.tsx"
    },
    "./native": {
      "types": "./src/native.tsx",
      "default": "./src/native.tsx"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.10.5",
    "typescript": "^5.7.2"
  },
  "peerDependencies": {
    "@react-native-async-storage/async-storage": ">=2.0.0",
    "react": "^18.0.0 || ^19.0.0"
  },
  "peerDependenciesMeta": {
    "@react-native-async-storage/async-storage": {
      "optional": true
    }
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

**Step 3: Create src/stores/ui.ts**

```typescript
import { createStore } from "zustand";

export interface UIState {
  // State
  sidebarOpen: boolean;
  activeModal: string | null;
  theme: "light" | "dark" | "system";

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setTheme: (theme: UIState["theme"]) => void;
}

export const createUIStore = () =>
  createStore<UIState>((set) => ({
    // Initial state
    sidebarOpen: false,
    activeModal: null,
    theme: "system",

    // Actions
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    openModal: (modalId) => set({ activeModal: modalId }),
    closeModal: () => set({ activeModal: null }),
    setTheme: (theme) => set({ theme }),
  }));

export type UIStore = ReturnType<typeof createUIStore>;
```

**Step 4: Create src/stores/preferences.ts**

```typescript
import { createStore } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

export interface PreferencesState {
  // State
  locale: string | null; // null = use device/browser default
  onboardingComplete: boolean;

  // Actions
  setLocale: (locale: string | null) => void;
  completeOnboarding: () => void;
  resetPreferences: () => void;
}

const initialState = {
  locale: null,
  onboardingComplete: false,
};

export const createPreferencesStore = (storage: StateStorage) =>
  createStore<PreferencesState>()(
    persist(
      (set) => ({
        ...initialState,

        setLocale: (locale) => set({ locale }),
        completeOnboarding: () => set({ onboardingComplete: true }),
        resetPreferences: () => set(initialState),
      }),
      {
        name: "app-preferences",
        storage: createJSONStorage(() => storage),
      }
    )
  );

export type PreferencesStore = ReturnType<typeof createPreferencesStore>;
```

**Step 5: Create src/index.ts**

```typescript
// Store types
export type { UIState, UIStore } from "./stores/ui";
export type { PreferencesState, PreferencesStore } from "./stores/preferences";

// Store creators (for custom implementations)
export { createUIStore } from "./stores/ui";
export { createPreferencesStore } from "./stores/preferences";
```

**Step 6: Create src/web.tsx**

```typescript
"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import { createUIStore, type UIStore, type UIState } from "./stores/ui";
import {
  createPreferencesStore,
  type PreferencesStore,
  type PreferencesState,
} from "./stores/preferences";

// localStorage adapter
const localStorageAdapter = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

// Contexts
const UIStoreContext = createContext<UIStore | null>(null);
const PreferencesStoreContext = createContext<PreferencesStore | null>(null);

// Provider
interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const uiStoreRef = useRef<UIStore | null>(null);
  const preferencesStoreRef = useRef<PreferencesStore | null>(null);

  if (!uiStoreRef.current) {
    uiStoreRef.current = createUIStore();
  }
  if (!preferencesStoreRef.current) {
    preferencesStoreRef.current = createPreferencesStore(localStorageAdapter);
  }

  return (
    <UIStoreContext.Provider value={uiStoreRef.current}>
      <PreferencesStoreContext.Provider value={preferencesStoreRef.current}>
        {children}
      </PreferencesStoreContext.Provider>
    </UIStoreContext.Provider>
  );
}

// Hooks
export function useUIStore<T>(selector: (state: UIState) => T): T {
  const store = useContext(UIStoreContext);
  if (!store) throw new Error("useUIStore must be used within StoreProvider");
  return useStore(store, selector);
}

export function usePreferencesStore<T>(selector: (state: PreferencesState) => T): T {
  const store = useContext(PreferencesStoreContext);
  if (!store) throw new Error("usePreferencesStore must be used within StoreProvider");
  return useStore(store, selector);
}

// Hydration hook for SSR safety
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// Re-export types
export type { UIState, PreferencesState };
```

**Step 7: Create src/native.tsx**

```typescript
import React, {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import { createUIStore, type UIStore, type UIState } from "./stores/ui";
import {
  createPreferencesStore,
  type PreferencesStore,
  type PreferencesState,
} from "./stores/preferences";

// AsyncStorage adapter (requires @react-native-async-storage/async-storage)
function createAsyncStorageAdapter() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    return {
      getItem: async (name: string) => {
        return AsyncStorage.getItem(name);
      },
      setItem: async (name: string, value: string) => {
        await AsyncStorage.setItem(name, value);
      },
      removeItem: async (name: string) => {
        await AsyncStorage.removeItem(name);
      },
    };
  } catch {
    // Fallback to in-memory storage if AsyncStorage not available
    const memory: Record<string, string> = {};
    return {
      getItem: (name: string) => memory[name] ?? null,
      setItem: (name: string, value: string) => {
        memory[name] = value;
      },
      removeItem: (name: string) => {
        delete memory[name];
      },
    };
  }
}

// Contexts
const UIStoreContext = createContext<UIStore | null>(null);
const PreferencesStoreContext = createContext<PreferencesStore | null>(null);

// Provider
interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const uiStoreRef = useRef<UIStore | null>(null);
  const preferencesStoreRef = useRef<PreferencesStore | null>(null);

  if (!uiStoreRef.current) {
    uiStoreRef.current = createUIStore();
  }
  if (!preferencesStoreRef.current) {
    const storage = createAsyncStorageAdapter();
    preferencesStoreRef.current = createPreferencesStore(storage);
  }

  return (
    <UIStoreContext.Provider value={uiStoreRef.current}>
      <PreferencesStoreContext.Provider value={preferencesStoreRef.current}>
        {children}
      </PreferencesStoreContext.Provider>
    </UIStoreContext.Provider>
  );
}

// Hooks
export function useUIStore<T>(selector: (state: UIState) => T): T {
  const store = useContext(UIStoreContext);
  if (!store) throw new Error("useUIStore must be used within StoreProvider");
  return useStore(store, selector);
}

export function usePreferencesStore<T>(selector: (state: PreferencesState) => T): T {
  const store = useContext(PreferencesStoreContext);
  if (!store) throw new Error("usePreferencesStore must be used within StoreProvider");
  return useStore(store, selector);
}

// Re-export types
export type { UIState, PreferencesState };
```

**Step 8: Run pnpm install**

Run: `pnpm install`
Expected: Dependencies installed, no errors

**Step 9: Verify types**

Run: `pnpm --filter @repo/store typecheck`
Expected: No type errors

**Step 10: Commit**

```bash
git add packages/store
git commit -m "feat(store): add zustand store package with UI and preferences stores"
```

---

## Task 3: Integrate i18n into Web App

**Files:**
- Create: `apps/web/src/i18n/request.ts`
- Modify: `apps/web/next.config.ts`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/app/page.tsx`
- Modify: `apps/web/package.json`

**Step 1: Add dependency to apps/web/package.json**

Add to dependencies:
```json
"@repo/i18n": "workspace:*"
```

**Step 2: Create apps/web/src/i18n/request.ts**

```typescript
import i18nConfig from "@repo/i18n/web";

export default i18nConfig;
```

**Step 3: Modify apps/web/next.config.ts**

Add next-intl plugin:

```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {};

const sentryConfig = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

export default withSentryConfig(withNextIntl(nextConfig), sentryConfig);
```

**Step 4: Modify apps/web/src/app/layout.tsx**

```typescript
import React from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { TRPCProvider } from "@/lib/trpc/provider";
import { PostHogProvider } from "@/lib/posthog";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "Built with Next.js + Expo",
};

async function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  // Clerk requires keys at build time for static pages
  // Wrap conditionally to allow builds without keys
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <PostHogProvider>
        <TRPCProvider>
          <IntlProvider>{children}</IntlProvider>
        </TRPCProvider>
      </PostHogProvider>
    );
  }

  return (
    <ClerkProvider>
      <PostHogProvider>
        <TRPCProvider>
          <IntlProvider>{children}</IntlProvider>
        </TRPCProvider>
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

**Step 5: Modify apps/web/src/app/page.tsx to use translations**

```typescript
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="mt-4 text-xl text-gray-600">{t("subtitle")}</p>
    </main>
  );
}
```

**Step 6: Run pnpm install**

Run: `pnpm install`
Expected: Dependencies installed

**Step 7: Verify build**

Run: `pnpm --filter @repo/web build`
Expected: Build succeeds

**Step 8: Commit**

```bash
git add apps/web
git commit -m "feat(web): integrate i18n with next-intl"
```

---

## Task 4: Integrate i18n into Mobile App

**Files:**
- Modify: `apps/mobile/package.json`
- Modify: `apps/mobile/App.tsx`

**Step 1: Add dependencies to apps/mobile/package.json**

Add to dependencies:
```json
"@repo/i18n": "workspace:*",
"expo-localization": "~15.0.1"
```

**Step 2: Modify apps/mobile/App.tsx**

```typescript
import * as Sentry from "@sentry/react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/lib/auth";
import { TRPCProvider } from "./src/lib/trpc";
import { PostHogProvider } from "./src/lib/posthog";
import { I18nProvider, useTranslations } from "@repo/i18n/native";

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
  const t = useTranslations("home");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("title")}</Text>
      <Text style={styles.subtitle}>{t("subtitle")}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

function App() {
  return (
    <AuthProvider>
      <PostHogProvider>
        <TRPCProvider>
          <I18nProvider>
            <HomeScreen />
          </I18nProvider>
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

**Step 3: Run pnpm install**

Run: `pnpm install`
Expected: Dependencies installed

**Step 4: Verify types**

Run: `pnpm --filter @repo/mobile typecheck`
Expected: No type errors

**Step 5: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): integrate i18n with use-intl and expo-localization"
```

---

## Task 5: Integrate Store into Web App

**Files:**
- Modify: `apps/web/package.json`
- Modify: `apps/web/src/app/layout.tsx`

**Step 1: Add dependency to apps/web/package.json**

Add to dependencies:
```json
"@repo/store": "workspace:*"
```

**Step 2: Modify apps/web/src/app/layout.tsx**

```typescript
import React from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { TRPCProvider } from "@/lib/trpc/provider";
import { PostHogProvider } from "@/lib/posthog";
import { StoreProvider } from "@repo/store/web";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",
  description: "Built with Next.js + Expo",
};

async function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  // Clerk requires keys at build time for static pages
  // Wrap conditionally to allow builds without keys
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <PostHogProvider>
        <TRPCProvider>
          <IntlProvider>
            <StoreProvider>{children}</StoreProvider>
          </IntlProvider>
        </TRPCProvider>
      </PostHogProvider>
    );
  }

  return (
    <ClerkProvider>
      <PostHogProvider>
        <TRPCProvider>
          <IntlProvider>
            <StoreProvider>{children}</StoreProvider>
          </IntlProvider>
        </TRPCProvider>
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

**Step 3: Run pnpm install**

Run: `pnpm install`
Expected: Dependencies installed

**Step 4: Verify build**

Run: `pnpm --filter @repo/web build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add apps/web
git commit -m "feat(web): integrate zustand store provider"
```

---

## Task 6: Integrate Store into Mobile App

**Files:**
- Modify: `apps/mobile/package.json`
- Modify: `apps/mobile/App.tsx`

**Step 1: Add dependencies to apps/mobile/package.json**

Add to dependencies:
```json
"@repo/store": "workspace:*",
"@react-native-async-storage/async-storage": "^2.1.0"
```

**Step 2: Modify apps/mobile/App.tsx**

```typescript
import * as Sentry from "@sentry/react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/lib/auth";
import { TRPCProvider } from "./src/lib/trpc";
import { PostHogProvider } from "./src/lib/posthog";
import { I18nProvider, useTranslations } from "@repo/i18n/native";
import { StoreProvider } from "@repo/store/native";

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
  const t = useTranslations("home");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("title")}</Text>
      <Text style={styles.subtitle}>{t("subtitle")}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

function App() {
  return (
    <AuthProvider>
      <PostHogProvider>
        <TRPCProvider>
          <I18nProvider>
            <StoreProvider>
              <HomeScreen />
            </StoreProvider>
          </I18nProvider>
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

**Step 3: Run pnpm install**

Run: `pnpm install`
Expected: Dependencies installed

**Step 4: Verify types**

Run: `pnpm --filter @repo/mobile typecheck`
Expected: No type errors

**Step 5: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): integrate zustand store provider with AsyncStorage"
```

---

## Task 7: Create CLAUDE.md [x]

**Files:**
- Create: `CLAUDE.md`

**Step 1: Create CLAUDE.md**

...

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md for AI assistant guidance"
```

---

## Task 8: Create AGENTS.md [x]

**Files:**
- Create: `AGENTS.md`

**Step 1: Create AGENTS.md**

...

**Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add AGENTS.md for generic AI assistant guidance"
```

---

## Task 9: Update README.md [x]

**Files:**
- Modify: `README.md`

**Step 1: Update the Stack table in README.md**

Add to the Stack table after "Styling":
```markdown
| **i18n** | next-intl (web), use-intl (mobile) |
| **State** | Zustand |
```

**Step 2: Update Project Structure in README.md**

Update packages section:
```markdown
├── packages/
│   ├── api/                 # tRPC routers and procedures
│   ├── db/                  # Drizzle schema and client
│   ├── shared/              # Shared types, utils, validators
│   ├── analytics/           # PostHog wrapper (web + native)
│   ├── monitoring/          # Sentry wrapper (web + native)
│   ├── payments/            # Stripe wrapper
│   ├── i18n/                # Internationalization (next-intl + use-intl)
│   └── store/               # Zustand state management
```

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README with i18n and state management"
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
| `apps/web/src/app/layout.tsx` | Web root layout, provider hierarchy |
| `apps/web/src/app/api/trpc/[trpc]/route.ts` | tRPC API handler |
| `apps/mobile/App.tsx` | Mobile entry point, provider hierarchy |
| `packages/api/src/routers/` | tRPC router definitions |
| `packages/db/src/schema.ts` | Database schema (Drizzle) |
| `packages/i18n/locales/en.json` | Translation strings |
| `packages/store/src/stores/` | Zustand store definitions |

## Architecture Patterns

### Provider Hierarchy (both platforms)
```
Auth → Analytics → tRPC → i18n → Store → App
```

### API Layer (tRPC)
- Routers in `packages/api/src/routers/`
- Context handles both cookie auth (web) and Bearer token auth (mobile)
- Use `protectedProcedure` for authenticated endpoints

### State Management
- **Server state**: tRPC + React Query (automatic)
- **Client state**: Zustand (`@repo/store`)
- **Persisted preferences**: Zustand persist middleware

### i18n
- Translations in `packages/i18n/locales/*.json`
- Web: `useTranslations('namespace')` from `next-intl`
- Mobile: `useTranslations('namespace')` from `use-intl`
- Fallback: Always falls back to English if translation missing

## Code Style

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` + type guards)
- No `@ts-ignore` or `@ts-expect-error`
- Prefer `interface` over `type` for object shapes

### Imports
- Use `@/` alias for app-internal imports
- Use `@repo/` for workspace packages
- Group: external → @repo → @/ → relative

### Naming
- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions/variables**: camelCase (`getUserProfile`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)

### Patterns
- Follow existing patterns in codebase
- New packages follow `./web` and `./native` export pattern
- Prefer composition over inheritance
- Keep components small and focused

## Environment Variables

### Required for Development
```bash
DATABASE_URL=               # Neon connection string
```

### Optional (features disabled if missing)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
```

### Mobile-Specific
```bash
EXPO_PUBLIC_API_URL=        # API URL for mobile (use ngrok for local dev)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

## Common Tasks

### Add a translation
1. Edit `packages/i18n/locales/en.json`
2. Use with `const t = useTranslations('namespace')`

### Add a Zustand store
1. Create store in `packages/store/src/stores/`
2. Add to providers in `web.tsx` and `native.tsx`
3. Export hooks from both files

### Add an API endpoint
1. Create/modify router in `packages/api/src/routers/`
2. Add to `appRouter` in `packages/api/src/routers/index.ts`
3. Use in app: `api.routerName.procedureName.useQuery()`

### Add a database table
1. Add schema in `packages/db/src/schema.ts`
2. Run `pnpm db:push` to sync

### Add a new package
1. Create `packages/my-package/` with `package.json` and `tsconfig.json`
2. Follow existing package patterns
3. Run `pnpm install`

## Claude-Specific Guidance

### Tool Preferences
- Use `Edit` tool for modifying existing files (not `Write`)
- Run `lsp_diagnostics` after code changes
- Use `explore` agents for unfamiliar code areas

### Before Completing
- Run `pnpm typecheck` to verify no type errors
- Run `pnpm lint` to check for lint issues
- If build commands exist, verify they pass

### Communication
- Be concise, avoid fluff
- Don't explain obvious code
- Ask clarifying questions if requirements are ambiguous
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md for AI assistant guidance"
```

---

## Task 8: Create AGENTS.md

**Files:**
- Create: `AGENTS.md`

**Step 1: Create AGENTS.md**

```markdown
# AGENTS.md

> Generic instructions for AI coding assistants working on this codebase.
> For Claude-specific guidance, see [CLAUDE.md](./CLAUDE.md).

## Project Overview

This is a **production-ready monorepo template** for building full-stack applications with:
- **Web**: Next.js 15 (App Router, React 19)
- **Mobile**: Expo (React Native)
- **Backend**: tRPC + Neon (Serverless PostgreSQL) + Drizzle ORM

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

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build
pnpm build
```

## Project Structure

```
├── apps/
│   ├── web/                 # Next.js web application
│   └── mobile/              # Expo mobile app
├── packages/
│   ├── api/                 # tRPC routers
│   ├── db/                  # Database schema
│   ├── shared/              # Shared types, utils
│   ├── analytics/           # PostHog (web + native)
│   ├── monitoring/          # Sentry (web + native)
│   ├── payments/            # Stripe
│   ├── i18n/                # Internationalization
│   └── store/               # Zustand state
├── tooling/                 # Shared configs
└── scripts/                 # Setup scripts
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/layout.tsx` | Web root layout |
| `apps/mobile/App.tsx` | Mobile entry point |
| `packages/api/src/routers/` | API endpoints |
| `packages/db/src/schema.ts` | Database schema |
| `packages/i18n/locales/en.json` | Translations |
| `packages/store/src/stores/` | State stores |

## Architecture

### Provider Order
```
Auth → Analytics → tRPC → i18n → Store → App
```

### State Management
- **Server state**: tRPC + React Query
- **Client state**: Zustand

### Shared Packages Pattern
Packages with platform-specific code export:
- `@repo/package` - Shared types/utils
- `@repo/package/web` - Web implementation
- `@repo/package/native` - Mobile implementation

## Code Style

### TypeScript
- Strict mode, no `any`
- Prefer `interface` for objects

### Naming
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Imports Order
1. External packages
2. `@repo/*` workspace packages
3. `@/*` app aliases
4. Relative imports

## Common Tasks

### Add translation
Edit `packages/i18n/locales/en.json`, use `useTranslations('namespace')`

### Add API endpoint
Create router in `packages/api/src/routers/`, add to `appRouter`

### Add database table
Add to `packages/db/src/schema.ts`, run `pnpm db:push`

### Add state store
Create in `packages/store/src/stores/`, add to providers

## Verification

Before marking work complete:
```bash
pnpm typecheck  # No type errors
pnpm lint       # No lint errors
pnpm build      # Builds successfully
```
```

**Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add AGENTS.md for generic AI assistant guidance"
```

---

## Task 9: Update README.md

**Files:**
- Modify: `README.md`

**Step 1: Update the Stack table in README.md**

Add to the Stack table after "Styling":
```markdown
| **i18n** | next-intl (web), use-intl (mobile) |
| **State** | Zustand |
```

**Step 2: Update Project Structure in README.md**

Update packages section:
```markdown
├── packages/
│   ├── api/                 # tRPC routers and procedures
│   ├── db/                  # Drizzle schema and client
│   ├── shared/              # Shared types, utils, validators
│   ├── analytics/           # PostHog wrapper (web + native)
│   ├── monitoring/          # Sentry wrapper (web + native)
│   ├── payments/            # Stripe wrapper
│   ├── i18n/                # Internationalization (next-intl + use-intl)
│   └── store/               # Zustand state management
```

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README with i18n and state management"
```

---

## Task 10: Final Verification

**Step 1: Install all dependencies**

Run: `pnpm install`
Expected: Clean install, no errors

**Step 2: Type check entire monorepo**

Run: `pnpm typecheck`
Expected: No type errors

**Step 3: Lint entire monorepo**

Run: `pnpm lint`
Expected: No lint errors (or only pre-existing ones)

**Step 4: Build web app**

Run: `pnpm --filter @repo/web build`
Expected: Build succeeds

**Step 5: Final commit (if any uncommitted changes)**

```bash
git status
# If clean, done. Otherwise:
git add -A
git commit -m "chore: final cleanup"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Create `packages/i18n` with next-intl + use-intl |
| 2 | Create `packages/store` with Zustand + persist |
| 3 | Integrate i18n into web app |
| 4 | Integrate i18n into mobile app |
| 5 | Integrate store into web app |
| 6 | Integrate store into mobile app |
| 7 | Create CLAUDE.md | [x] |
| 8 | Create AGENTS.md | [x] |
| 9 | Update README.md | [x] |
| 10 | Final verification | [x] |
