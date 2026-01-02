# SaaS Demo Expansion Design

## Overview

Expand the Vercel + Expo monorepo template into a fully-featured SaaS demo application. This expansion showcases common SaaS patterns including a comprehensive UI kit, transactional emails, push notifications, cloud storage, real-time updates, and data export.

## Tech Stack Additions

| Feature | Technology |
|---------|------------|
| **Web UI** | shadcn/ui, Radix UI, Recharts |
| **Mobile UI** | NativeWind, React Native Reanimated |
| **Email** | SendGrid, React Email |
| **Push Notifications** | Expo Notifications |
| **Realtime** | Pusher |
| **Storage** | Uploadthing |
| **PDF Export** | `@react-pdf/renderer` (web), `expo-print` (mobile) |
| **Deep Linking** | Expo Router, Universal Links |

## New Package Architecture

We will introduce several new packages to the `packages/` directory to modularize the new functionality:

```
packages/
├── ui/                      # shadcn/ui components (web)
├── ui-native/               # NativeWind components (mobile)
├── email/                   # SendGrid + React Email templates
├── notifications/           # Expo Push + in-app notifications
├── realtime/                # Pusher WebSocket wrapper
└── storage/                 # Uploadthing + PDF/CSV export
```

## Implementation Details

### 1. UI Components

#### Web (`@repo/ui`)
Integrate `shadcn/ui` with a comprehensive set of components (~25):
- **Layout**: Card, Separator, Sheet, Sidebar, Tabs
- **Forms**: Button, Input, Label, Select, Checkbox, Switch, Textarea, Form
- **Feedback**: Alert, Toast, Skeleton, Progress, Badge
- **Overlays**: Dialog, Dropdown Menu, Popover, Tooltip, Command
- **Data**: Table, DataTable, Avatar, Calendar, Charts (Recharts)

#### Mobile (`@repo/ui-native`)
Custom components built with `NativeWind` (Tailwind for React Native) matching the shadcn aesthetic.
- Shared design tokens (colors, spacing) defined in a base Tailwind configuration.
- Reusable components: Button, Input, Card, Avatar, Badge, etc.

### 2. Email (`@repo/email`)
Transactional and notification emails using SendGrid and React Email.
- **Transactional**: Welcome, email verification, password reset.
- **Notifications**: Activity alerts, weekly digest.
- **Ops Alerts**: Error spikes, new signups, payment failures.

### 3. Push Notifications (`@repo/notifications`)
Unified notification system for web and mobile.
- **Expo Push**: Integration for mobile push notifications.
- **In-App**: Notification center (read/unread state) in both web and mobile apps.
- **Preferences**: User-level toggles for different notification types.

### 4. Storage & Media (`@repo/storage`)
Cloud storage and media handling.
- **Uploadthing**: File uploads for profile photos and other assets.
- **Photo Picker**: `expo-image-picker` for mobile gallery/camera integration.
- **Flow**: Profile photo upload with optimistic updates.

### 5. Sharing & Export (`@repo/storage`)
- **Native Share**: `expo-sharing` for mobile.
- **PDF Export**: `@react-pdf/renderer` for web, `expo-print` for mobile.
- **CSV Export**: Shared utility for generating CSVs from data tables.
- **Deep Linking**: Expo Router configuration for Universal Links.

### 6. Realtime (`@repo/realtime`)
Live updates using Pusher.
- **Dashboard**: Real-time stats and charts.
- **Activity Feed**: Live updates as actions occur.
- **Auth**: Private channels integrated with Clerk auth.

## Database Schema Additions (`packages/db`)

```typescript
// User preferences
export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id").primaryKey().notNull(),
  emailActivityAlerts: boolean("email_activity_alerts").default(true),
  emailWeeklyDigest: boolean("email_weekly_digest").default(true),
  emailMarketing: boolean("email_marketing").default(false),
  pushEnabled: boolean("push_enabled").default(true),
  pushActivityAlerts: boolean("push_activity_alerts").default(true),
  pushReminders: boolean("push_reminders").default(true),
});

// Push tokens (multi-device)
export const pushTokens = pgTable("push_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  token: text("token").notNull(),
  platform: text("platform", { enum: ["ios", "android", "web"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// In-app notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  data: jsonb("data"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity feed
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## Environment Variables

### Global / Web (`.env.local`)
```bash
# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
OPS_ALERT_EMAIL=

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# Uploadthing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Deep Linking
NEXT_PUBLIC_APP_URL=
```

### Mobile (`.env`)
```bash
# Pusher
EXPO_PUBLIC_PUSHER_KEY=
EXPO_PUBLIC_PUSHER_CLUSTER=

# Deep Linking
EXPO_PUBLIC_APP_SCHEME=
```

## Implementation Order

1.  **UI Packages**: Initialize `@repo/ui` and `@repo/ui-native`.
2.  **Storage**: Set up Uploadthing and profile photo upload flow.
3.  **Dashboard Screens**: Build core dashboard UI for web and mobile.
4.  **Realtime**: Integrate Pusher for live dashboard updates.
5.  **Email**: Set up SendGrid and React Email templates.
6.  **Notifications**: Implement Expo Push and in-app notification center.
7.  **Export/Share**: Add PDF/CSV export and deep linking.
