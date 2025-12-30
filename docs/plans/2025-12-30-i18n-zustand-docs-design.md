# i18n, Zustand & AI Documentation Design

## Overview

Extend the Vercel + Expo monorepo template with:
1. **Internationalization (i18n)** — `next-intl` (web) + `use-intl` (mobile)
2. **Client State Management** — Zustand with platform-specific persistence
3. **AI Assistant Documentation** — CLAUDE.md and AGENTS.md

## Goals

- Unified translation API across web and mobile
- Type-safe translation keys with autocomplete
- Persisted user preferences (language, theme, onboarding)
- SSR-safe state management for Next.js
- Comprehensive AI assistant onboarding docs

## Package Architecture

Following the existing pattern (`packages/analytics`, `packages/monitoring`):

```
packages/
├── i18n/                    # Internationalization
│   ├── locales/
│   │   └── en.json          # English translations (source of truth)
│   ├── src/
│   │   ├── index.ts         # Shared types, locale constants
│   │   ├── web.ts           # next-intl setup
│   │   └── native.ts        # use-intl + expo-localization
│   ├── package.json
│   └── tsconfig.json
│
├── store/                   # Zustand state management
│   ├── src/
│   │   ├── index.ts         # Shared store types & hooks
│   │   ├── stores/
│   │   │   ├── ui.ts        # UI state (modals, sidebar, theme)
│   │   │   └── preferences.ts  # Persisted preferences
│   │   ├── web.ts           # Web provider + localStorage
│   │   └── native.ts        # Native provider + AsyncStorage
│   ├── package.json
│   └── tsconfig.json
```

Root-level documentation:
```
/
├── CLAUDE.md                # Claude-specific guidance
├── AGENTS.md                # Generic AI assistant doc
```

---

## i18n Design

### Translation File Structure

```json
// packages/i18n/locales/en.json
{
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try again",
    "save": "Save",
    "cancel": "Cancel"
  },
  "auth": {
    "signIn": "Sign in",
    "signOut": "Sign out",
    "signUp": "Sign up"
  },
  "home": {
    "title": "Welcome",
    "subtitle": "Built with Next.js + Expo"
  }
}
```

### Type Safety

```typescript
// packages/i18n/src/index.ts
import en from '../locales/en.json';

export type Messages = typeof en;
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
```

Both platforms get autocomplete on translation keys via shared types.

### Web Implementation (Next.js)

```typescript
// packages/i18n/src/web.ts
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './index';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale ?? defaultLocale;
  
  try {
    return {
      locale: resolvedLocale,
      messages: (await import(`../locales/${resolvedLocale}.json`)).default,
    };
  } catch {
    // Fallback to English if locale file doesn't exist
    return {
      locale: defaultLocale,
      messages: (await import('../locales/en.json')).default,
    };
  }
});
```

Integration in `apps/web`:
- Middleware detects locale (Accept-Language header, cookie)
- `NextIntlClientProvider` wraps app in layout
- No URL-based routing initially (single locale infrastructure)

### Mobile Implementation (Expo)

```typescript
// packages/i18n/src/native.ts
import { IntlProvider } from 'use-intl';
import { getLocales } from 'expo-localization';
import { defaultLocale, locales } from './index';
import en from '../locales/en.json';

export function getDeviceLocale(): string {
  const deviceLocale = getLocales()[0]?.languageCode ?? defaultLocale;
  return locales.includes(deviceLocale as any) ? deviceLocale : defaultLocale;
}

export function getMessages(locale: string) {
  // Fallback to English if translations don't exist
  try {
    return require(`../locales/${locale}.json`);
  } catch {
    return en;
  }
}

export { IntlProvider };
```

### Fallback Behavior

1. User preference (from Zustand preferences store)
2. Device/browser locale
3. English (`en`) as final fallback

---

## Zustand Design

### Store Definitions

```typescript
// packages/store/src/stores/ui.ts
import { create } from 'zustand';

export interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  setTheme: (theme: UIState['theme']) => void;
}

export const createUIStore = () =>
  create<UIState>((set) => ({
    sidebarOpen: false,
    activeModal: null,
    theme: 'system',
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    openModal: (id) => set({ activeModal: id }),
    closeModal: () => set({ activeModal: null }),
    setTheme: (theme) => set({ theme }),
  }));
```

```typescript
// packages/store/src/stores/preferences.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PreferencesState {
  locale: string | null;        // null = use device default
  onboardingComplete: boolean;
  setLocale: (locale: string | null) => void;
  completeOnboarding: () => void;
}

export const createPreferencesStore = (storage: any) =>
  create<PreferencesState>()(
    persist(
      (set) => ({
        locale: null,
        onboardingComplete: false,
        setLocale: (locale) => set({ locale }),
        completeOnboarding: () => set({ onboardingComplete: true }),
      }),
      {
        name: 'preferences',
        storage: createJSONStorage(() => storage),
      }
    )
  );
```

### Platform-Specific Persistence

| Platform | Storage | Package |
|----------|---------|---------|
| Web | `localStorage` | Built-in |
| Mobile | `AsyncStorage` | `@react-native-async-storage/async-storage` |

### SSR Safety (Next.js)

```typescript
// packages/store/src/web.ts
import { useState, useEffect } from 'react';

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

// Usage: Don't render persisted state until hydrated
function Component() {
  const hydrated = useHydrated();
  const locale = usePreferencesStore((s) => s.locale);
  
  if (!hydrated) return null; // or skeleton
  return <div>Locale: {locale}</div>;
}
```

### Integration with i18n

The preferences store's `locale` value feeds into the i18n provider:

```typescript
// Locale resolution order:
// 1. preferences.locale (user override)
// 2. Device/browser locale
// 3. 'en' (fallback)

const effectiveLocale = preferences.locale ?? getDeviceLocale() ?? 'en';
```

---

## Documentation Design

### CLAUDE.md Structure (~300 lines)

```markdown
# CLAUDE.md

## Project Overview
- Template purpose and philosophy
- Tech stack table (Next.js 15, Expo 52, Neon, Clerk, etc.)

## Quick Start
- pnpm install
- Environment setup
- pnpm dev / pnpm dev:web / pnpm dev:mobile

## Architecture
- Monorepo structure diagram
- Package relationships
- Data flow (tRPC, React Query)

## Key Files
- apps/web/src/app/layout.tsx — Root layout, providers
- apps/mobile/App.tsx — Mobile entry, providers
- packages/api/src/routers/ — tRPC endpoints
- packages/db/src/schema.ts — Database schema
- packages/i18n/locales/ — Translation files
- packages/store/src/stores/ — Zustand stores

## Code Style
- TypeScript strict mode
- Import order conventions
- Naming conventions (camelCase, PascalCase)
- Patterns to follow (existing package patterns)
- Anti-patterns to avoid

## Environment Variables
- Required vs optional
- Where to get each key
- Platform-specific prefixes (NEXT_PUBLIC_, EXPO_PUBLIC_)

## Common Tasks
- Adding a new translation
- Adding a new store
- Adding an API endpoint
- Adding a new package

## Claude-Specific Guidance
- Prefer Edit tool over Write for existing files
- Always run lsp_diagnostics after changes
- Use explore agents for unfamiliar code areas
```

### AGENTS.md Structure (~250 lines)

Similar to CLAUDE.md but:
- Tool-agnostic language
- No Claude-specific behaviors
- Works for Cursor, Copilot, Windsurf, etc.
- References CLAUDE.md for Claude-specific guidance

---

## Dependencies

### packages/i18n

```json
{
  "dependencies": {
    "next-intl": "^3.x",
    "use-intl": "^3.x"
  },
  "peerDependencies": {
    "expo-localization": "^15.x",
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

### packages/store

```json
{
  "dependencies": {
    "zustand": "^5.x"
  },
  "peerDependencies": {
    "@react-native-async-storage/async-storage": "^2.x",
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

### App-level additions

**apps/web:**
- `@repo/i18n` (workspace)
- `@repo/store` (workspace)

**apps/mobile:**
- `@repo/i18n` (workspace)
- `@repo/store` (workspace)
- `expo-localization` (if not already present)
- `@react-native-async-storage/async-storage`

---

## Integration Points

### Web (apps/web/src/app/layout.tsx)

Provider order:
```
ClerkProvider
  → PostHogProvider
    → TRPCProvider
      → NextIntlClientProvider
        → StoreProvider
          → {children}
```

### Mobile (apps/mobile/App.tsx)

Provider order:
```
AuthProvider
  → PostHogProvider
    → TRPCProvider
      → IntlProvider
        → StoreProvider
          → {children}
```

---

## Environment Variables

No new environment variables required:
- i18n: Translations are bundled at build time
- Zustand: Client-side only, no server config

---

## Future Considerations

1. **Additional locales**: Add `es.json`, `fr.json` to `packages/i18n/locales/`
2. **URL-based routing**: Enable `next-intl` middleware for `/en/`, `/es/` paths
3. **MMKV persistence**: Replace AsyncStorage with `react-native-mmkv` for performance
4. **Translation management**: Integrate with Crowdin/Lokalise for external translators
