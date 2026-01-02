# SaaS Demo Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the monorepo template into a fully-featured SaaS demo with shadcn/ui, NativeWind, SendGrid email, Expo Push notifications, Uploadthing storage, Pusher realtime, and export/sharing capabilities.

**Architecture:** Seven new packages (@repo/ui, @repo/ui-native, @repo/email, @repo/notifications, @repo/realtime, @repo/storage) plus dashboard screens on both web and mobile. Each package follows the existing ./web and ./native export pattern where applicable.

**Tech Stack:** shadcn/ui, Radix UI, Recharts, NativeWind, React Native Reanimated, SendGrid, React Email, Expo Notifications, Pusher, Uploadthing, @react-pdf/renderer, expo-print, expo-sharing

**Design Doc:** `docs/plans/2025-01-02-saas-demo-expansion-design.md`

---

## PHASES AND TASKS

### Phase 1: UI Foundation (Tasks 1-4)

#### Task 1: Create @repo/ui package with shadcn setup
**Files:**
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `packages/ui/tailwind.config.ts`
- Create: `packages/ui/src/lib/utils.ts`
- Create: `packages/ui/src/index.ts`

**Step 1: Create package.json**
```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./lib/utils": "./src/lib/utils.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.7.2"
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

**Step 3: Create utils.ts**
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 4: Create tailwind.config.ts**
```typescript
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate],
};

export default config;
```

**Step 5: Commit**
```bash
git add packages/ui
git commit -m "feat(ui): initialize shadcn/ui package"
```

#### Task 2: Add core shadcn components to @repo/ui
**Files:**
- Create: `packages/ui/src/components/button.tsx`
- Create: `packages/ui/src/components/card.tsx`
- Create: `packages/ui/src/components/input.tsx`
- Create: `packages/ui/src/components/label.tsx`
- Create: `packages/ui/src/components/badge.tsx`
- Create: `packages/ui/src/components/separator.tsx`
- Modify: `packages/ui/src/index.ts`

**Step 1: Add Button**
```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Step 2: Add Card**
```tsx
import * as React from "react"
import { cn } from "../lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow", className)} {...props} />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardContent }
```

**Step 3: Export from index.ts**
```typescript
export * from "./components/button";
export * from "./components/card";
export * from "./components/input";
export * from "./components/label";
export * from "./components/badge";
export * from "./components/separator";
export * from "./lib/utils";
```

**Step 4: Commit**
```bash
git add packages/ui
git commit -m "feat(ui): add core shadcn components"
```

#### Task 3: Add dashboard shadcn components
**Files:**
- Create: `packages/ui/src/components/sidebar.tsx`, `packages/ui/src/components/tabs.tsx`, `packages/ui/src/components/avatar.tsx`, etc.
- Create: `packages/ui/src/components/table.tsx`, `packages/ui/src/components/data-table.tsx`
- Create: `packages/ui/src/components/charts.tsx`

**Step 1: Install TanStack Table and Recharts**
```bash
pnpm --filter @repo/ui add @tanstack/react-table recharts
```

**Step 2: Add Chart components**
```tsx
"use client"
import * as React from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

export const Chart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={350}>
    <BarChart data={data}>
      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
      <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
    </BarChart>
  </ResponsiveContainer>
)
```

**Step 3: Commit**
```bash
git add packages/ui
git commit -m "feat(ui): add dashboard components"
```

#### Task 4: Create @repo/ui-native package with NativeWind
**Files:**
- Create: `packages/ui-native/package.json`
- Create: `packages/ui-native/tailwind.config.ts`
- Create: `packages/ui-native/src/components/Button.tsx`
- Create: `packages/ui-native/src/components/Card.tsx`
- Create: `packages/ui-native/src/index.ts`

**Step 1: Create package.json**
```json
{
  "name": "@repo/ui-native",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "nativewind": "4.1.23",
    "react-native-reanimated": "~3.16.1",
    "lucide-react-native": "^0.468.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^18.3.12",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.7.2"
  }
}
```

**Step 2: Add Native Button**
```tsx
import { TouchableOpacity, Text, View } from "react-native";
import { styled } from "nativewind";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

export const Button = ({ title, onPress, className }: { title: string, onPress: () => void, className?: string }) => (
  <StyledTouchableOpacity 
    onPress={onPress}
    className={cn("bg-primary px-4 py-2 rounded-md items-center justify-center", className)}
  >
    <StyledText className="text-primary-foreground font-medium">{title}</StyledText>
  </StyledTouchableOpacity>
);
```

**Step 3: Commit**
```bash
git add packages/ui-native
git commit -m "feat(ui-native): initialize NativeWind package with core components"
```

---

### Phase 2: Storage (Tasks 5-6)

#### Task 5: Create @repo/storage package with Uploadthing
**Files:**
- Create: `packages/storage/package.json`
- Create: `packages/storage/src/uploadthing.ts`
- Create: `packages/storage/src/client.ts`
- Create: `packages/storage/src/index.ts`

**Step 1: Create File Router**
```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";
const f = createUploadthing();

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      // Auth logic here
      return { userId: "user_123" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

**Step 2: Commit**
```bash
git add packages/storage
git commit -m "feat(storage): add Uploadthing package"
```

#### Task 6: Add PDF/CSV export utilities
**Files:**
- Create: `packages/storage/src/pdf.ts`
- Create: `packages/storage/src/csv.ts`
- Modify: `packages/storage/src/index.ts`

**Step 1: Add PDF generator**
```typescript
import { pdf } from '@react-pdf/renderer';
import React from 'react';

export async function generatePdf(blob: any) {
  const instance = pdf(blob);
  const buffer = await instance.toBuffer();
  return buffer;
}
```

**Step 2: Add CSV generator**
```typescript
export function generateCsv(data: any[]) {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
  return `${headers}\n${rows}`;
}
```

**Step 3: Commit**
```bash
git add packages/storage
git commit -m "feat(storage): add PDF and CSV export utilities"
```

---

### Phase 3: Dashboard Screens (Tasks 7-10)

#### Task 7: Integrate @repo/ui into web app
- Modify `apps/web/package.json` to add `@repo/ui`
- Update `apps/web/tailwind.config.ts` to extend `@repo/ui/tailwind.config`
- Update `apps/web/src/app/globals.css` with shadcn theme variables

#### Task 8: Create web dashboard layout and pages
- Create `apps/web/src/app/(dashboard)/layout.tsx` with a responsive sidebar and header.
- Create `apps/web/src/app/(dashboard)/page.tsx` with statistics cards (using `@repo/ui/Card`) and an activity chart.
- Create settings and notification pages.

#### Task 9: Integrate @repo/ui-native into mobile app
- Update `apps/mobile/package.json` and `tailwind.config.ts`.
- Configure `babel.config.js` for NativeWind.

#### Task 10: Create mobile tab navigation and screens
- Set up Expo Router tabs in `apps/mobile/app/(tabs)/`.
- Implement Dashboard, Notifications, and Settings screens using components from `@repo/ui-native`.

---

### Phase 4: Realtime (Tasks 11-13)

#### Task 11: Create @repo/realtime package
**Step 1: Create Pusher Server Client**
```typescript
import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
```

#### Task 12: Add realtime client hooks
**Step 1: Create usePusher hook (web.tsx)**
```tsx
import PusherJS from "pusher-js";
import { createContext, useContext, useEffect, useState } from "react";

const PusherContext = createContext<PusherJS | null>(null);

export const PusherProvider = ({ children, pusherKey, cluster }: any) => {
  const [pusher, setPusher] = useState<PusherJS | null>(null);

  useEffect(() => {
    const p = new PusherJS(pusherKey, { cluster });
    setPusher(p);
    return () => p.disconnect();
  }, [pusherKey, cluster]);

  return <PusherContext.Provider value={pusher}>{children}</PusherContext.Provider>;
};
```

#### Task 13: Integrate realtime into dashboard
- Add `/api/pusher/auth` route in web app.
- Use `usePusher` to subscribe to activity channels and update dashboard state.

---

### Phase 5: Email (Tasks 14-16)

#### Task 14: Create @repo/email package
- Initialize SendGrid client in `src/client.ts`.
- Create a generic `sendEmail` helper.

#### Task 15: Add email templates
- Create `WelcomeEmail`, `VerificationEmail`, and `ActivityAlertEmail` using `react-email`.

#### Task 16: Add email preferences API
- Add fields to `user_preferences` table in Drizzle schema.
- Create tRPC procedures to manage these preferences.

---

### Phase 6: Notifications (Tasks 17-20)

#### Task 17: Create @repo/notifications package
- Define notification types and structure.

#### Task 18: Add push notification functionality
- Implement `registerForPushNotificationsAsync` using `expo-notifications`.
- Create a server-side `sendPushNotification` helper using Expo's API.

#### Task 19: Add in-app notification center
- Create `notifications` table in DB.
- Build UI components for a scrollable notification list with read/unread toggles.

#### Task 20: Add notification preferences
- Add push notification toggles to the settings screen and sync with DB.

---

### Phase 7: Export & Share (Tasks 21-24)

#### Task 21: Add photo picker and upload
- Use `expo-image-picker` on mobile.
- Use Uploadthing's `UploadButton` on web.

#### Task 22: Add export functionality
- Build a "Data Export" page where users can trigger PDF or CSV generation.

#### Task 23: Add native sharing
- Integrate `expo-sharing` to allow users to share the generated PDF on mobile.

#### Task 24: Add deep linking
- Configure `app.config.js` with `scheme` and `associatedDomains`.
- Set up deep link paths for notifications (e.g., `/notifications/:id`).

---

### Phase 8: Finalization (Task 25)

#### Task 25: Final verification and documentation
- Run `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
- Update `CLAUDE.md`, `AGENTS.md`, and `README.md` to include the new features and package architecture.
- Verify all integrations (Pusher, SendGrid, Uploadthing) with test keys.

**Step 1: Commit**
```bash
git add .
git commit -m "docs: update documentation for SaaS demo features"
```
