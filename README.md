# Vercel + Expo App Template

A production-ready monorepo template for building full-stack applications with Next.js, Expo (optional), and a curated set of integrations.

[![Use this template](https://img.shields.io/badge/use%20this-template-blue?style=for-the-badge)](https://github.com/gmackie/vercel-expo-app-template/generate)

## Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (React 19) |
| **Mobile** | Expo (React Native) - optional |
| **Database** | Neon (Serverless PostgreSQL) + Drizzle ORM |
| **Auth** | Clerk |
| **Payments** | Stripe |
| **Analytics** | PostHog |
| **Monitoring** | Sentry |
| **API** | tRPC |
| **Styling** | Tailwind CSS |
| **Package Manager** | pnpm + Turborepo |

## Quick Start

### Creating a New App

**Option 1: Use GitHub's template feature**

Click the green "Use this template" button above, or [click here](https://github.com/gmackie/vercel-expo-app-template/generate).

Then:
```bash
git clone https://github.com/YOUR_USERNAME/my-app.git
cd my-app
./scripts/setup.sh my-app
./scripts/provision.sh
pnpm dev
```

**Option 2: Clone directly**

```bash
git clone https://github.com/gmackie/vercel-expo-app-template.git my-app
cd my-app
./scripts/setup.sh my-app
./scripts/provision.sh
pnpm dev
```

**Option 2: Use the create script**

```bash
./scripts/create-app.sh my-app
```

**Option 3: Web-only (no mobile)**

```bash
./scripts/setup.sh my-app --no-mobile
```

## Project Structure

```
├── apps/
│   ├── web/                 # Next.js web application
│   │   ├── src/
│   │   │   ├── app/         # App router pages
│   │   │   └── lib/         # Client utilities
│   │   └── package.json
│   │
│   └── mobile/              # Expo mobile app (optional)
│       ├── src/
│       └── package.json
│
├── packages/
│   ├── api/                 # tRPC routers and procedures
│   ├── db/                  # Drizzle schema and client
│   ├── shared/              # Shared types, utils, validators
│   ├── analytics/           # PostHog wrapper (web + native)
│   ├── monitoring/          # Sentry wrapper (web + native)
│   └── payments/            # Stripe wrapper
│
├── tooling/
│   ├── eslint/              # Shared ESLint configs
│   └── typescript/          # Shared TypeScript configs
│
└── scripts/
    ├── setup.sh             # Rename template to your app
    ├── provision.sh         # Auto-provision external services
    └── create-app.sh        # All-in-one app creation
```

## Scripts

### `./scripts/setup.sh`

Renames the template to your app name and configures the monorepo.

```bash
# Basic usage
./scripts/setup.sh my-app

# Without mobile app
./scripts/setup.sh my-app --no-mobile
```

**What it does:**
- Renames all `@repo/*` packages to `@my-app/*`
- Updates app titles and metadata
- Creates `.env.local` from `.env.example`
- Reinstalls dependencies
- Initializes a fresh git repository

### `./scripts/provision.sh`

Interactively provisions external services and saves credentials to `.env.local`.

```bash
# Full provisioning
./scripts/provision.sh

# Neon only
./scripts/provision.sh --neon-only

# Skip specific services
./scripts/provision.sh --skip-clerk --skip-sentry
```

**Supported services:**
- **Neon** - Automatically creates database via CLI (`npm i -g neonctl`)
- **Clerk** - Manual key entry (dashboard required)
- **Stripe** - Manual key entry
- **PostHog** - Manual key entry
- **Sentry** - Manual key entry

### `./scripts/create-app.sh`

All-in-one script that clones, sets up, and optionally provisions.

```bash
./scripts/create-app.sh my-app
./scripts/create-app.sh my-app --no-mobile
./scripts/create-app.sh my-app --no-provision
```

## Development

### Web Only

```bash
# Start web app only
pnpm dev:web
```

### Mobile Development

The mobile app has three environments:

| Environment | Command | Description |
|-------------|---------|-------------|
| **Local** | `pnpm dev:mobile` | Uses ngrok tunnel, works with Expo Go |
| **Beta** | `pnpm eas:dev` | EAS build with internal distribution |
| **Production** | `pnpm eas:prod` | EAS build for App Store / Play Store |

#### Local Development

```bash
# Start full mobile dev environment (Next.js + ngrok + Expo)
pnpm dev:mobile

# With a static ngrok domain (requires paid ngrok)
./scripts/dev-mobile.sh --domain myapp

# Use Expo Go instead of dev client
./scripts/dev-mobile.sh --expo-go
```

**Prerequisites:**
- ngrok: `brew install ngrok`
- ngrok account: https://dashboard.ngrok.com (free tier works)
- jq: `brew install jq`

#### Beta / Internal Testing

Build a development client for testing on real devices without Expo Go:

```bash
# Build for iOS (ad-hoc signed for registered devices)
pnpm eas:dev --platform ios

# Build for Android (debug APK)
pnpm eas:dev --platform android

# Build for both
pnpm eas:dev --platform all
```

This creates a separate app (with `.dev` suffix on bundle ID) that can be installed alongside the production app.

**Register test devices:**
```bash
eas device:create
```

#### Production Build

```bash
# Build for App Store / Play Store
pnpm eas:prod --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### All Apps

```bash
# Start all apps in development mode
pnpm dev

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Build all packages
pnpm build
```

## Database

This template uses [Neon](https://neon.tech) - serverless PostgreSQL with autoscaling, branching, and a generous free tier.

```bash
# Push schema changes to Neon
pnpm db:push

# Open Drizzle Studio
pnpm db:studio

# Generate migrations
pnpm --filter @my-app/db db:generate
```

### Setting up Neon

**Option 1: Using the CLI (recommended)**

```bash
# Install the Neon CLI
npm install -g neonctl

# Authenticate
neonctl auth

# Run provisioning script
./scripts/provision.sh --neon-only
```

**Option 2: Manual setup**

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Copy the connection string to `.env.local`

### Scaling Beyond Neon

Neon's serverless PostgreSQL is excellent for most applications and scales well into production workloads. However, if you need:

- **Horizontal sharding** for massive write throughput
- **Global edge deployment** with single-digit millisecond latency worldwide
- **Vitess-powered MySQL** for proven hyperscale infrastructure

Consider migrating to [PlanetScale](https://planetscale.com). The migration path is straightforward:

1. Export your Drizzle schema
2. Update `packages/db` to use `drizzle-orm/planetscale-serverless`
3. Update `DATABASE_URL` to your PlanetScale connection string
4. Run migrations

Most apps will never need this - Neon handles significant scale with its autoscaling and read replicas.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Neon Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry Monitoring
SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub/GitLab
2. Import to Vercel
3. Set environment variables
4. Deploy

The `vercel.json` is pre-configured for the web app.

### Manual

```bash
pnpm build
pnpm start
```

## Adding New Packages

```bash
# Create a new package
mkdir packages/my-package
cd packages/my-package

# Initialize with the shared config
cat > package.json << EOF
{
  "name": "@my-app/my-package",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@my-app/typescript-config": "workspace:*",
    "typescript": "^5.7.2"
  }
}
EOF

# Add tsconfig
cat > tsconfig.json << EOF
{
  "extends": "@my-app/typescript-config/react-library.json",
  "include": ["src"],
  "exclude": ["node_modules"]
}
EOF

mkdir src
echo 'export const hello = "world";' > src/index.ts

# Install dependencies
cd ../..
pnpm install
```

## License

MIT
