# Deployment Guide

## Overview

| Trigger | Web Deploy | Mobile Build | Backend |
|---------|------------|--------------|---------|
| PR / feature branch | Vercel preview | - | - |
| `staging` branch | Vercel preview | EAS staging | staging |
| `main` branch | Vercel production | - | production |
| Tag `v*` | Vercel production | EAS production + submit | production |

## Quick Start

```bash
pnpm install
./scripts/dev-mobile.sh              # Local dev with ngrok
./scripts/dev-mobile.sh --staging    # Use staging backend
./scripts/dev-mobile.sh --production # Use production backend
```

## Vercel Setup

### Project Configuration

1. Go to https://vercel.com → Import Project
2. Select this repository
3. Configure:
   - **Root Directory**: `apps/web`
   - **Framework**: Next.js (auto-detect)
   - **Node.js Version**: 20.x
4. Set environment variables (see below)
5. Add domains:
   - Production: `<project>.apps.gmac.io`
   - Preview: auto-generated

### Environment Variables

```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

### Build Commands (auto-detected from vercel.json)

```
Install: cd ../.. && pnpm install
Build:   cd ../.. && pnpm turbo build --filter=@repo/web
```

## Mobile (EAS) Setup

### Profiles

| Profile | Bundle ID | Distribution | Use Case |
|---------|-----------|--------------|----------|
| development | `*.dev` | Internal | Dev client |
| staging | `*.staging` | Internal | TestFlight/beta testing |
| production | Base ID | App Store | Production release |

### Build Commands

```bash
# Development client
eas build --profile development --platform ios

# Staging (auto on staging branch push)
eas build --profile staging --platform all

# Production (auto on v* tag)
eas build --profile production --auto-submit --platform all
```

### EAS Secrets

Set in Expo dashboard or via CLI:
```bash
eas secret:create --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value pk_xxx
```

### App Store Setup

**iOS** - Update `apps/mobile/eas.json`:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-apple-id@example.com",
      "ascAppId": "your-app-store-connect-id",
      "appleTeamId": "YOUR_TEAM_ID"
    }
  }
}
```

**Android** - Add `apps/mobile/play-store-credentials.json`

## GitHub Actions Secrets

```
EXPO_TOKEN              # From expo.dev
DATABASE_URL            # For CI builds
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

## Local Development

### With ngrok (local API)

```bash
./scripts/dev-mobile.sh
```

This:
1. Starts Next.js on localhost
2. Creates ngrok tunnel
3. Launches Expo with tunnel URL

### With Remote Backend

```bash
./scripts/dev-mobile.sh --staging     # beta.<project>.apps.gmac.io
./scripts/dev-mobile.sh --production  # <project>.apps.gmac.io
```

### Backend Toggle in App

The app exposes backend URLs in `Constants.expoConfig.extra`:

```js
import Constants from 'expo-constants';

const { backendUrl, backendUrlStaging, backendUrlProd } = Constants.expoConfig.extra;

// Allow testers to toggle
const [useProd, setUseProd] = useState(false);
const apiUrl = useProd ? backendUrlProd : backendUrlStaging;
```

## Branch Workflow

```
feature/* → PR → staging → main → v1.0.0
              ↓          ↓        ↓
           Preview    Prod     Prod + Submit
           EAS stg    -        EAS prod
```

## Visual Distinction

Staging builds use different:
- App name: "My App Staging"
- Bundle ID: `com.example.myapp.staging`
- Icon: `assets/icon-staging.png` (create this)
- URL scheme: `myapp-staging://`

## Health Check

`GET /api/health` → `{"status": "healthy", "timestamp": "..."}`

## Demo Deployment

This template is deployed at:
- **Production**: https://demo.apps.gmac.io
- **Staging**: https://beta.demo.apps.gmac.io
