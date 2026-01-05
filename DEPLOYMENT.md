# Deployment Guide

This template supports multiple deployment strategies for both web and mobile apps.

## Web Deployment

### Vercel (Primary)

Vercel deployments use the `*.apps.gmac.io` domain pattern:

| Environment | URL Pattern | Trigger |
|-------------|-------------|---------|
| Production | `<project>.apps.gmac.io` | Push to main/master |
| Preview | Auto-generated Vercel URL | Pull request |

#### Quick Setup

1. Create project in Vercel dashboard (or use CLI)
2. Link to GitHub repository
3. Set Root Directory to repository root (uses `vercel.json` config)
4. Add custom domain: `<project>.apps.gmac.io`
5. Configure environment variables

#### CLI Setup

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login and link project
vercel login
vercel link

# Deploy
vercel --prod
```

#### Required Environment Variables

Set these in Vercel dashboard or via CLI:

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

#### GitHub Actions Secrets (for CI deployment)

```
VERCEL_TOKEN          # From vercel.com/account/tokens
VERCEL_ORG_ID         # From .vercel/project.json after linking
VERCEL_PROJECT_ID     # From .vercel/project.json after linking
```

### Docker + Kubernetes (Alternative)

For self-hosted deployments on the gmac.io k8s cluster.

| Environment | URL | Trigger |
|-------------|-----|---------|
| Production | `<project>.gmac.io` | Tagged release (v*) |

#### GitHub Secrets Required

```
REGISTRY_USERNAME      # Docker registry username
REGISTRY_PASSWORD      # Docker registry password  
KUBECONFIG            # Base64-encoded kubeconfig
```

#### Manual Docker Build

```bash
docker build -t registry.gmac.io/myapp/web:latest -f apps/web/Dockerfile .
docker login registry.gmac.io -u admin -p Admin123!
docker push registry.gmac.io/myapp/web:latest
```

#### Manual Kubernetes Deployment

```bash
export NAMESPACE=myapp
export IMAGE_TAG=latest
export REGISTRY=registry.gmac.io
export IMAGE_NAME=myapp/web

envsubst < k8s/namespace.yaml | kubectl apply -f -
envsubst < k8s/secrets.yaml | kubectl apply -f -
envsubst < k8s/production.yaml | kubectl apply -f -
```

## Mobile Deployment

### Development Environments

| Mode | Command | Description |
|------|---------|-------------|
| Local | `pnpm dev:mobile` | ngrok tunnel to local Next.js |
| Beta | `pnpm dev:mobile --beta` | Connect to beta.<project>.apps.gmac.io |
| Custom | `pnpm dev:mobile --beta https://api.example.com` | Any remote API |

### Build Profiles

| Profile | Bundle ID | Distribution | Use Case |
|---------|-----------|--------------|----------|
| development | `*.dev` | Internal | Dev client with hot reload |
| preview | `*.dev` | Internal | Testing builds |
| production | Base ID | App Store | Production release |

### EAS Builds

```bash
# Development client
eas build --profile development --platform ios

# Preview build (beta testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Build and auto-submit to stores
eas build --profile production --auto-submit --platform all
```

### CI/CD Mobile Builds

The GitHub workflow automatically:
- Builds preview for iOS/Android on push to main
- Builds and submits production on tagged releases (v*)

Required secret: `EXPO_TOKEN`

## Demo Deployment

This template is deployed as a demo at:

- **Production**: https://demo.apps.gmac.io
- **Vercel Project**: `demo`

### Setting Up a New Demo

1. Fork/clone this repository
2. Create Vercel project named `demo`:
   ```bash
   vercel link --project demo
   ```
3. Add domain `demo.apps.gmac.io` in Vercel dashboard
4. Configure DNS: CNAME `demo.apps.gmac.io` → `cname.vercel-dns.com`
5. Set environment variables in Vercel
6. Push to trigger deployment

## Environment Configuration

### Web (`apps/web/.env.local`)

```bash
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

### Mobile (`apps/mobile/.env`)

```bash
EXPO_PUBLIC_API_URL=https://demo.apps.gmac.io
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
EXPO_PUBLIC_POSTHOG_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EXPO_PUBLIC_SENTRY_DSN=https://...
```

## Release Process

### Web Release

Push to main/master triggers automatic Vercel deployment.

For k8s deployment (optional):
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Mobile Release

```bash
cd apps/mobile
eas build --profile production --auto-submit --platform all
```

## Monitoring

### Health Check

`GET /api/health` returns:
```json
{"status": "healthy", "timestamp": "2025-01-05T..."}
```

### Logs

Vercel: Dashboard → Project → Deployments → Functions tab

Kubernetes:
```bash
kubectl -n myapp logs -l app=web -f
```
