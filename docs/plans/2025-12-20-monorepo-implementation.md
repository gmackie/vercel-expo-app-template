# Monorepo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready Turborepo monorepo with Next.js web app, Expo mobile app, and shared packages for tRPC, Supabase, Clerk, Stripe, PostHog, and Sentry.

**Architecture:** Turborepo orchestrates builds across apps and packages. tRPC provides type-safe API layer consumed by both apps. Shared packages encapsulate third-party integrations with platform-specific implementations.

**Tech Stack:** Turborepo, pnpm, Next.js 14 (App Router), Expo SDK 51, tRPC v11, TanStack Query v5, Supabase, Clerk, Stripe, PostHog, Sentry, TypeScript 5.3+, Zod

---

## Phase 1: Foundation

### Task 1: Initialize pnpm Workspace

**Files:**
- Modify: `package.json`
- Create: `pnpm-workspace.yaml`

**Step 1: Create pnpm-workspace.yaml**

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

**Step 2: Update root package.json**

Replace entire contents:

```json
{
  "name": "vercel-app",
  "private": true,
  "packageManager": "pnpm@9.15.1",
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.3"
  }
}
```

**Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

**Step 4: Install dependencies**

Run: `pnpm install`
Expected: lockfile created, turbo installed

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: initialize pnpm workspace with turborepo"
```

---

### Task 2: Create TypeScript Tooling Package

**Files:**
- Create: `tooling/typescript/package.json`
- Create: `tooling/typescript/base.json`
- Create: `tooling/typescript/nextjs.json`
- Create: `tooling/typescript/react-library.json`

**Step 1: Create tooling/typescript/package.json**

```json
{
  "name": "@repo/typescript-config",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "files": ["*.json"]
}
```

**Step 2: Create tooling/typescript/base.json**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Base",
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "lib": ["ES2022"],
    "allowJs": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": true
  },
  "exclude": ["node_modules"]
}
```

**Step 3: Create tooling/typescript/nextjs.json**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Next.js",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "jsx": "preserve",
    "noEmit": true,
    "plugins": [{ "name": "next" }]
  }
}
```

**Step 4: Create tooling/typescript/react-library.json**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "React Library",
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "jsx": "react-jsx",
    "noEmit": true
  }
}
```

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: add shared typescript configurations"
```

---

### Task 3: Create ESLint Tooling Package

**Files:**
- Create: `tooling/eslint/package.json`
- Create: `tooling/eslint/base.js`
- Create: `tooling/eslint/nextjs.js`
- Create: `tooling/eslint/react.js`

**Step 1: Create tooling/eslint/package.json**

```json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "files": ["*.js"],
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.18.1",
    "@typescript-eslint/parser": "^8.18.1",
    "eslint": "^8.57.0",
    "eslint-config-next": "^15.1.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.1.0"
  }
}
```

**Step 2: Create tooling/eslint/base.js**

```javascript
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint:recommended", "prettier"],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  env: {
    es2022: true,
    node: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
  ignorePatterns: ["node_modules/", "dist/", ".next/", ".turbo/"],
};
```

**Step 3: Create tooling/eslint/nextjs.js**

```javascript
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./base.js",
    "next/core-web-vitals",
  ],
  env: {
    browser: true,
    node: true,
  },
};
```

**Step 4: Create tooling/eslint/react.js**

```javascript
/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./base.js",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  plugins: ["react", "react-hooks"],
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
};
```

**Step 5: Install eslint tooling deps**

Run: `pnpm install`
Expected: dependencies installed for eslint tooling

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: add shared eslint configurations"
```

---

## Phase 2: Shared Packages

### Task 4: Create Shared Package (Types, Utils, Validators)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/validators.ts`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/utils.ts`

**Step 1: Create packages/shared/package.json**

```json
{
  "name": "@repo/shared",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./validators": {
      "types": "./src/validators.ts",
      "default": "./src/validators.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.7.2"
  }
}
```

**Step 2: Create packages/shared/tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/shared/src/types.ts**

```typescript
export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
```

**Step 4: Create packages/shared/src/validators.ts**

```typescript
import { z } from "zod";

export const emailSchema = z.string().email();

export const userSchema = z.object({
  id: z.string(),
  email: emailSchema,
  createdAt: z.coerce.date(),
});

export type UserInput = z.infer<typeof userSchema>;

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
```

**Step 5: Create packages/shared/src/utils.ts**

```typescript
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function invariant(
  condition: unknown,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
```

**Step 6: Create packages/shared/src/index.ts**

```typescript
export * from "./types.js";
export * from "./validators.js";
export * from "./utils.js";
```

**Step 7: Create packages/shared/.eslintrc.js**

```javascript
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/react.js"],
};
```

**Step 8: Install shared package deps**

Run: `pnpm install`
Expected: shared package dependencies installed

**Step 9: Verify typecheck**

Run: `pnpm --filter @repo/shared typecheck`
Expected: No errors

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: add shared package with types, validators, and utils"
```

---

### Task 5: Create Database Package (Supabase)

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/client.ts`
- Create: `packages/db/src/types.ts`

**Step 1: Create packages/db/package.json**

```json
{
  "name": "@repo/db",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./client": {
      "types": "./src/client.ts",
      "default": "./src/client.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.47.10"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.7.2"
  }
}
```

**Step 2: Create packages/db/tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/db/src/types.ts**

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          clerk_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          clerk_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          clerk_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
```

**Step 4: Create packages/db/src/client.ts**

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types.js";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createSupabaseClient() {
  return createClient<Database>(
    getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

export function createSupabaseServiceClient() {
  return createClient<Database>(
    getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
```

**Step 5: Create packages/db/src/index.ts**

```typescript
export * from "./types.js";
export * from "./client.js";
```

**Step 6: Create packages/db/.eslintrc.js**

```javascript
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/base.js"],
};
```

**Step 7: Install db package deps**

Run: `pnpm install`
Expected: db package dependencies installed

**Step 8: Verify typecheck**

Run: `pnpm --filter @repo/db typecheck`
Expected: No errors

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: add database package with supabase client"
```

---

## Phase 3: API Package (tRPC)

### Task 6: Create API Package with tRPC

**Files:**
- Create: `packages/api/package.json`
- Create: `packages/api/tsconfig.json`
- Create: `packages/api/src/index.ts`
- Create: `packages/api/src/trpc.ts`
- Create: `packages/api/src/context.ts`
- Create: `packages/api/src/routers/index.ts`
- Create: `packages/api/src/routers/user.ts`

**Step 1: Create packages/api/package.json**

```json
{
  "name": "@repo/api",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./client": {
      "types": "./src/client.ts",
      "default": "./src/client.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@repo/db": "workspace:*",
    "@repo/shared": "workspace:*",
    "@trpc/server": "^11.0.0-rc.660",
    "@trpc/client": "^11.0.0-rc.660",
    "@trpc/react-query": "^11.0.0-rc.660",
    "@tanstack/react-query": "^5.62.7",
    "superjson": "^2.2.2",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@clerk/backend": "^1.21.0",
    "typescript": "^5.7.2"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

**Step 2: Create packages/api/tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/api/src/trpc.ts**

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});
```

**Step 4: Create packages/api/src/context.ts**

```typescript
import { createSupabaseServiceClient } from "@repo/db/client";
import type { SupabaseClient } from "@repo/db/client";
import { verifyToken } from "@clerk/backend";

export interface Context {
  userId: string | null;
  db: SupabaseClient;
}

interface CreateContextOptions {
  req: {
    headers: {
      authorization?: string;
      cookie?: string;
    };
  };
  clerkUserId?: string | null;
}

export async function createContext({
  req,
  clerkUserId,
}: CreateContextOptions): Promise<Context> {
  const db = createSupabaseServiceClient();
  let userId = clerkUserId ?? null;

  // If no userId from cookie auth (Next.js), try Bearer token (Expo)
  if (!userId) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      try {
        const secretKey = process.env.CLERK_SECRET_KEY;
        if (secretKey) {
          const verified = await verifyToken(token, { secretKey });
          userId = verified.sub;
        }
      } catch {
        // Invalid token, userId remains null
      }
    }
  }

  return { userId, db };
}
```

**Step 5: Create packages/api/src/routers/user.ts**

```typescript
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc.js";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const { data: user } = await ctx.db
      .from("users")
      .select("*")
      .eq("clerk_id", ctx.userId)
      .single();

    return user;
  }),

  updateProfile: protectedProcedure
    .input(z.object({ email: z.string().email().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { data: user } = await ctx.db
        .from("users")
        .update(input)
        .eq("clerk_id", ctx.userId)
        .select()
        .single();

      return user;
    }),
});
```

**Step 6: Create packages/api/src/routers/index.ts**

```typescript
import { router } from "../trpc.js";
import { userRouter } from "./user.js";

export const appRouter = router({
  user: userRouter,
});

export type AppRouter = typeof appRouter;
```

**Step 7: Create packages/api/src/client.ts**

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./routers/index.js";

export const trpc = createTRPCReact<AppRouter>();
```

**Step 8: Create packages/api/src/index.ts**

```typescript
export { appRouter, type AppRouter } from "./routers/index.js";
export { createContext, type Context } from "./context.js";
export { router, publicProcedure, protectedProcedure } from "./trpc.js";
```

**Step 9: Create packages/api/.eslintrc.js**

```javascript
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/react.js"],
};
```

**Step 10: Install api package deps**

Run: `pnpm install`
Expected: api package dependencies installed

**Step 11: Verify typecheck**

Run: `pnpm --filter @repo/api typecheck`
Expected: No errors

**Step 12: Commit**

```bash
git add -A
git commit -m "feat: add api package with trpc routers and context"
```

---

## Phase 4: Next.js Web App

### Task 7: Create Next.js App

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/.eslintrc.js`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`
- Create: `apps/web/src/app/globals.css`

**Step 1: Create apps/web/package.json**

```json
{
  "name": "@repo/web",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/api": "workspace:*",
    "@repo/db": "workspace:*",
    "@repo/shared": "workspace:*",
    "@clerk/nextjs": "^6.9.6",
    "@tanstack/react-query": "^5.62.7",
    "@trpc/client": "^11.0.0-rc.660",
    "@trpc/react-query": "^11.0.0-rc.660",
    "@trpc/server": "^11.0.0-rc.660",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "superjson": "^2.2.2"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "typescript": "^5.7.2"
  }
}
```

**Step 2: Create apps/web/tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 3: Create apps/web/next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/api", "@repo/db", "@repo/shared"],
};

export default nextConfig;
```

**Step 4: Create apps/web/.eslintrc.js**

```javascript
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/nextjs.js"],
};
```

**Step 5: Create apps/web/src/app/globals.css**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

html,
body {
  height: 100%;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
```

**Step 6: Create apps/web/src/app/layout.tsx**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vercel App",
  description: "Next.js + Expo Monorepo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Step 7: Create apps/web/src/app/page.tsx**

```tsx
export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Vercel App</h1>
      <p>Next.js + Expo Monorepo with tRPC</p>
    </main>
  );
}
```

**Step 8: Install web app deps**

Run: `pnpm install`
Expected: web app dependencies installed

**Step 9: Verify build**

Run: `pnpm --filter @repo/web build`
Expected: Build completes successfully

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: add next.js web app"
```

---

### Task 8: Add tRPC to Next.js App

**Files:**
- Create: `apps/web/src/app/api/trpc/[trpc]/route.ts`
- Create: `apps/web/src/lib/trpc/client.ts`
- Create: `apps/web/src/lib/trpc/server.ts`
- Create: `apps/web/src/lib/trpc/provider.tsx`
- Modify: `apps/web/src/app/layout.tsx`

**Step 1: Create apps/web/src/app/api/trpc/[trpc]/route.ts**

```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@repo/api";
import { auth } from "@clerk/nextjs/server";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const { userId } = await auth();
      return createContext({
        req: {
          headers: {
            authorization: req.headers.get("authorization") ?? undefined,
          },
        },
        clerkUserId: userId,
      });
    },
  });

export { handler as GET, handler as POST };
```

**Step 2: Create apps/web/src/lib/trpc/client.ts**

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@repo/api";

export const trpc = createTRPCReact<AppRouter>();
```

**Step 3: Create apps/web/src/lib/trpc/server.ts**

```typescript
import "server-only";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { headers } from "next/headers";
import superjson from "superjson";
import type { AppRouter } from "@repo/api";

function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return `http://localhost:3000`;
}

export const serverTrpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const headersList = await headers();
        return {
          cookie: headersList.get("cookie") ?? "",
        };
      },
    }),
  ],
});
```

**Step 4: Create apps/web/src/lib/trpc/provider.tsx**

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "./client";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:3000`;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

**Step 5: Update apps/web/src/app/layout.tsx**

Replace entire contents:

```tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vercel App",
  description: "Next.js + Expo Monorepo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**Step 6: Verify typecheck**

Run: `pnpm --filter @repo/web typecheck`
Expected: No errors

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: integrate trpc with next.js app"
```

---

## Phase 5: Expo Mobile App

### Task 9: Create Expo App

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/metro.config.js`
- Create: `apps/mobile/App.tsx`
- Create: `apps/mobile/babel.config.js`

**Step 1: Create apps/mobile/package.json**

```json
{
  "name": "@repo/mobile",
  "version": "0.0.0",
  "private": true,
  "main": "App.tsx",
  "scripts": {
    "dev": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "build": "echo 'Use EAS Build for production'",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/api": "workspace:*",
    "@repo/shared": "workspace:*",
    "@clerk/clerk-expo": "^2.5.1",
    "@tanstack/react-query": "^5.62.7",
    "@trpc/client": "^11.0.0-rc.660",
    "@trpc/react-query": "^11.0.0-rc.660",
    "expo": "~52.0.23",
    "expo-secure-store": "~14.0.1",
    "expo-status-bar": "~2.0.1",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "superjson": "^2.2.2"
  },
  "devDependencies": {
    "@babel/core": "^7.26.0",
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/react": "~18.3.12",
    "typescript": "^5.7.2"
  }
}
```

**Step 2: Create apps/mobile/tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "strict": true,
    "jsx": "react-native",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**Step 3: Create apps/mobile/app.json**

```json
{
  "expo": {
    "name": "Vercel App",
    "slug": "vercel-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "vercel-app",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.vercelapp.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#ffffff"
      },
      "package": "com.vercelapp.mobile"
    }
  }
}
```

**Step 4: Create apps/mobile/metro.config.js**

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

config.resolver.disableHierarchicalLookup = true;

module.exports = config;
```

**Step 5: Create apps/mobile/babel.config.js**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
```

**Step 6: Create apps/mobile/App.tsx**

```tsx
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vercel App</Text>
      <Text style={styles.subtitle}>Expo + tRPC</Text>
      <StatusBar style="auto" />
    </View>
  );
}

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

**Step 7: Create apps/mobile/.eslintrc.js**

```javascript
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/react.js"],
  env: {
    "react-native/react-native": true,
  },
};
```

**Step 8: Install mobile app deps**

Run: `pnpm install`
Expected: mobile app dependencies installed

**Step 9: Verify typecheck**

Run: `pnpm --filter @repo/mobile typecheck`
Expected: No errors

**Step 10: Commit**

```bash
git add -A
git commit -m "feat: add expo mobile app"
```

---

### Task 10: Add tRPC and Clerk to Expo App

**Files:**
- Create: `apps/mobile/src/lib/trpc.tsx`
- Create: `apps/mobile/src/lib/auth.tsx`
- Modify: `apps/mobile/App.tsx`

**Step 1: Create apps/mobile/src/lib/auth.tsx**

```tsx
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import type { ReactNode } from "react";

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore errors
    }
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}

export { useAuth };
```

**Step 2: Create apps/mobile/src/lib/trpc.tsx**

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState, type ReactNode } from "react";
import superjson from "superjson";
import type { AppRouter } from "@repo/api";
import { useAuth } from "./auth";

export const trpc = createTRPCReact<AppRouter>();

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export function TRPCProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${API_URL}/api/trpc`,
          transformer: superjson,
          async headers() {
            const token = await getToken();
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

**Step 3: Update apps/mobile/App.tsx**

Replace entire contents:

```tsx
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/lib/auth";
import { TRPCProvider } from "./src/lib/trpc";

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vercel App</Text>
      <Text style={styles.subtitle}>Expo + tRPC</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TRPCProvider>
        <HomeScreen />
      </TRPCProvider>
    </AuthProvider>
  );
}

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

**Step 4: Verify typecheck**

Run: `pnpm --filter @repo/mobile typecheck`
Expected: No errors

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: integrate trpc and clerk with expo app"
```

---

## Phase 6: Integration Packages

### Task 11: Create Analytics Package (PostHog)

**Files:**
- Create: `packages/analytics/package.json`
- Create: `packages/analytics/tsconfig.json`
- Create: `packages/analytics/src/index.ts`
- Create: `packages/analytics/src/web.ts`
- Create: `packages/analytics/src/native.ts`
- Create: `packages/analytics/src/events.ts`

**Step 1: Create packages/analytics/package.json**

```json
{
  "name": "@repo/analytics",
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
      "types": "./src/native.ts",
      "default": "./src/native.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "posthog-js": "^1.203.1",
    "posthog-react-native": "^3.3.11"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.7.2"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

**Step 2: Create packages/analytics/tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/analytics/src/events.ts**

```typescript
export const AnalyticsEvents = {
  PAGE_VIEW: "page_view",
  SIGN_UP: "sign_up",
  SIGN_IN: "sign_in",
  SIGN_OUT: "sign_out",
  PURCHASE_STARTED: "purchase_started",
  PURCHASE_COMPLETED: "purchase_completed",
} as const;

export type AnalyticsEvent =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}
```

**Step 4: Create packages/analytics/src/web.ts**

```typescript
import posthog from "posthog-js";
import type { AnalyticsEvent, EventProperties } from "./events.js";

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    console.warn("PostHog key not configured");
    return;
  }

  posthog.init(key, {
    api_host: "https://us.i.posthog.com",
    capture_pageview: false,
  });

  initialized = true;
}

export function identify(userId: string, properties?: EventProperties) {
  if (!initialized) return;
  posthog.identify(userId, properties);
}

export function track(event: AnalyticsEvent, properties?: EventProperties) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function reset() {
  if (!initialized) return;
  posthog.reset();
}
```

**Step 5: Create packages/analytics/src/native.ts**

```typescript
import PostHog from "posthog-react-native";
import type { AnalyticsEvent, EventProperties } from "./events.js";

let client: PostHog | null = null;

export async function initAnalytics() {
  const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!key) {
    console.warn("PostHog key not configured");
    return;
  }

  client = await PostHog.initAsync(key, {
    host: "https://us.i.posthog.com",
  });
}

export function identify(userId: string, properties?: EventProperties) {
  client?.identify(userId, properties);
}

export function track(event: AnalyticsEvent, properties?: EventProperties) {
  client?.capture(event, properties);
}

export function reset() {
  client?.reset();
}
```

**Step 6: Create packages/analytics/src/index.ts**

```typescript
export * from "./events.js";
```

**Step 7: Install analytics package deps**

Run: `pnpm install`
Expected: analytics package dependencies installed

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add analytics package with posthog integration"
```

---

### Task 12: Create Monitoring Package (Sentry)

**Files:**
- Create: `packages/monitoring/package.json`
- Create: `packages/monitoring/tsconfig.json`
- Create: `packages/monitoring/src/index.ts`
- Create: `packages/monitoring/src/web.ts`
- Create: `packages/monitoring/src/native.ts`

**Step 1: Create packages/monitoring/package.json**

```json
{
  "name": "@repo/monitoring",
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
      "types": "./src/native.ts",
      "default": "./src/native.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@sentry/nextjs": "^8.45.0",
    "@sentry/react-native": "^6.5.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.7.2"
  }
}
```

**Step 2: Create packages/monitoring/tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/monitoring/src/web.ts**

```typescript
import * as Sentry from "@sentry/nextjs";

export function initMonitoring() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn("Sentry DSN not configured");
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  });
}

export function setUser(userId: string, email?: string) {
  Sentry.setUser({ id: userId, email });
}

export function clearUser() {
  Sentry.setUser(null);
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}
```

**Step 4: Create packages/monitoring/src/native.ts**

```typescript
import * as Sentry from "@sentry/react-native";

export function initMonitoring() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.warn("Sentry DSN not configured");
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
  });
}

export function setUser(userId: string, email?: string) {
  Sentry.setUser({ id: userId, email });
}

export function clearUser() {
  Sentry.setUser(null);
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}
```

**Step 5: Create packages/monitoring/src/index.ts**

```typescript
export type { SeverityLevel } from "@sentry/nextjs";
```

**Step 6: Install monitoring package deps**

Run: `pnpm install`
Expected: monitoring package dependencies installed

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add monitoring package with sentry integration"
```

---

### Task 13: Create Payments Package (Stripe)

**Files:**
- Create: `packages/payments/package.json`
- Create: `packages/payments/tsconfig.json`
- Create: `packages/payments/src/index.ts`
- Create: `packages/payments/src/server.ts`
- Create: `packages/payments/src/client.ts`

**Step 1: Create packages/payments/package.json**

```json
{
  "name": "@repo/payments",
  "version": "0.0.0",
  "private": true,
  "license": "MIT",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./server": {
      "types": "./src/server.ts",
      "default": "./src/server.ts"
    },
    "./client": {
      "types": "./src/client.ts",
      "default": "./src/client.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "stripe": "^17.4.0",
    "@stripe/stripe-js": "^5.3.0",
    "@stripe/react-stripe-js": "^3.1.1"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.7.2"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0"
  }
}
```

**Step 2: Create packages/payments/tsconfig.json**

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

**Step 3: Create packages/payments/src/server.ts**

```typescript
import Stripe from "stripe";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(secretKey);
}

export async function createCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

export async function createCustomer({
  email,
  clerkUserId,
}: {
  email: string;
  clerkUserId: string;
}) {
  const stripe = getStripe();

  const customer = await stripe.customers.create({
    email,
    metadata: { clerkUserId },
  });

  return customer;
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export { Stripe };
```

**Step 4: Create packages/payments/src/client.ts**

```typescript
import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

export { Elements, PaymentElement } from "@stripe/react-stripe-js";
```

**Step 5: Create packages/payments/src/index.ts**

```typescript
export type { Stripe } from "stripe";
```

**Step 6: Install payments package deps**

Run: `pnpm install`
Expected: payments package dependencies installed

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add payments package with stripe integration"
```

---

## Phase 7: Environment and Documentation

### Task 14: Create Environment Template and Verify Full Build

**Files:**
- Create: `.env.example`
- Create: `apps/web/.env.example`
- Create: `apps/mobile/.env.example`

**Step 1: Create root .env.example**

```bash
# This file lists all required environment variables.
# Copy to .env.local and fill in your values.

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

**Step 2: Create apps/web/.env.example**

```bash
# Web app environment variables
# Copy to .env.local

# API URL (set automatically on Vercel)
VERCEL_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

**Step 3: Create apps/mobile/.env.example**

```bash
# Mobile app environment variables
# Copy to .env

# API URL (your deployed Next.js app)
EXPO_PUBLIC_API_URL=

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

# PostHog
EXPO_PUBLIC_POSTHOG_KEY=

# Sentry
EXPO_PUBLIC_SENTRY_DSN=
```

**Step 4: Verify full workspace install**

Run: `pnpm install`
Expected: All dependencies installed without errors

**Step 5: Verify turbo build (dry run)**

Run: `pnpm build --dry-run`
Expected: Build order displayed, no errors

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: add environment variable templates"
```

---

## Completion Checklist

After all tasks complete:
- [ ] `pnpm install` succeeds
- [ ] `pnpm build` succeeds (after env vars set)
- [ ] `pnpm typecheck` succeeds
- [ ] `pnpm lint` succeeds
- [ ] `pnpm dev` starts both apps
- [ ] All packages export correctly
