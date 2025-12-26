#!/bin/bash
set -e

# =============================================================================
# Service Provisioning Script
# =============================================================================
# This script automatically provisions external services for your app:
# - Neon database (PostgreSQL)
# - Clerk application
# - Sentry project
# - PostHog project
# - Stripe
#
# Prerequisites:
# - neonctl CLI: npm install -g neonctl
# - Clerk, Sentry, PostHog accounts with API tokens set as env vars
#
# Usage: ./scripts/provision.sh [options]
#
# Options:
#   --neon-only      Only provision Neon database
#   --skip-neon      Skip Neon provisioning
#   --skip-clerk     Skip Clerk provisioning  
#   --skip-sentry    Skip Sentry provisioning
#   --skip-posthog   Skip PostHog provisioning
#   --dry-run        Show what would be done without doing it
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }
step() { echo -e "${CYAN}→${NC} $1"; }

# Default options
PROVISION_NEON=true
PROVISION_CLERK=true
PROVISION_SENTRY=true
PROVISION_POSTHOG=true
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --neon-only)
            PROVISION_CLERK=false
            PROVISION_SENTRY=false
            PROVISION_POSTHOG=false
            shift
            ;;
        --skip-neon)
            PROVISION_NEON=false
            shift
            ;;
        --skip-clerk)
            PROVISION_CLERK=false
            shift
            ;;
        --skip-sentry)
            PROVISION_SENTRY=false
            shift
            ;;
        --skip-posthog)
            PROVISION_POSTHOG=false
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./scripts/provision.sh [options]"
            echo ""
            echo "Options:"
            echo "  --neon-only      Only provision Neon database"
            echo "  --skip-neon      Skip Neon provisioning"
            echo "  --skip-clerk     Skip Clerk provisioning"
            echo "  --skip-sentry    Skip Sentry provisioning"
            echo "  --skip-posthog   Skip PostHog provisioning"
            echo "  --dry-run        Show what would be done"
            echo "  --help, -h       Show this help message"
            exit 0
            ;;
        *)
            error "Unknown argument: $1"
            exit 1
            ;;
    esac
done

# Get app name from package.json
APP_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "my-app")
# Convert to valid database/project name (replace @ and / with nothing, - is ok)
SAFE_NAME=$(echo "$APP_NAME" | sed 's/@//g' | sed 's/\//-/g' | sed 's/--/-/g')
# Convert to valid Neon project name (underscores instead of hyphens for db name)
DB_NAME=$(echo "$SAFE_NAME" | sed 's/-/_/g')

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                 Service Provisioning Script                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
info "App Name: ${APP_NAME}"
info "Safe Name: ${SAFE_NAME}"
if [[ "$DRY_RUN" == true ]]; then
    warn "DRY RUN MODE - No changes will be made"
fi
echo ""

# Check for .env.local
ENV_FILE=".env.local"
if [[ ! -f "$ENV_FILE" ]]; then
    warn ".env.local not found, creating from .env.example"
    cp .env.example .env.local
fi

# Function to update .env.local
update_env() {
    local key=$1
    local value=$2
    
    if [[ "$DRY_RUN" == true ]]; then
        info "Would set ${key}=***"
        return
    fi
    
    # Check if key exists
    if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
        # Update existing key
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        else
            sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        fi
    else
        # Add new key
        echo "${key}=${value}" >> "$ENV_FILE"
    fi
}

# =============================================================================
# Neon Database (PostgreSQL)
# =============================================================================
provision_neon() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Neon Database (PostgreSQL)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check if neonctl CLI is installed
    if ! command -v neonctl &> /dev/null; then
        warn "Neon CLI not found."
        echo ""
        
        read -p "Would you like to install neonctl now? (Y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            step "Installing neonctl..."
            npm install -g neonctl
            
            if ! command -v neonctl &> /dev/null; then
                error "Failed to install neonctl"
                info "Try installing manually: npm install -g neonctl"
                info "Or set up manually at https://console.neon.tech"
                echo ""
                
                read -p "Enter DATABASE_URL (or press Enter to skip): " DB_URL
                if [[ -n "$DB_URL" ]]; then
                    update_env "DATABASE_URL" "$DB_URL"
                    success "Database URL saved to .env.local"
                    
                    # Run migrations
                    step "Running database migrations..."
                    pnpm db:push 2>/dev/null || warn "Could not run migrations automatically"
                else
                    warn "Skipping Neon setup"
                fi
                return 0
            fi
            success "neonctl installed successfully"
        else
            info "Set up manually at https://console.neon.tech"
            echo ""
            
            read -p "Enter DATABASE_URL (or press Enter to skip): " DB_URL
            if [[ -n "$DB_URL" ]]; then
                update_env "DATABASE_URL" "$DB_URL"
                success "Database URL saved to .env.local"
                
                # Run migrations
                step "Running database migrations..."
                pnpm db:push 2>/dev/null || warn "Could not run migrations automatically"
            else
                warn "Skipping Neon setup"
            fi
            return 0
        fi
    fi
    
    # Check if logged in
    if ! neonctl me &> /dev/null 2>&1; then
        info "Not logged into Neon. Running 'neonctl auth'..."
        if [[ "$DRY_RUN" == false ]]; then
            neonctl auth
        fi
    fi
    
    PROJECT_NAME="${SAFE_NAME}"
    
    step "Creating Neon project: ${PROJECT_NAME}"
    
    if [[ "$DRY_RUN" == true ]]; then
        info "Would create project: ${PROJECT_NAME}"
        info "Would get connection string"
        return 0
    fi
    
    # Check if project already exists
    EXISTING_PROJECT=$(neonctl projects list --output json 2>/dev/null | jq -r ".projects[] | select(.name == \"${PROJECT_NAME}\") | .id" 2>/dev/null || echo "")
    
    if [[ -n "$EXISTING_PROJECT" ]]; then
        warn "Project '${PROJECT_NAME}' already exists (ID: ${EXISTING_PROJECT})"
        read -p "Use existing project? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
        PROJECT_ID="$EXISTING_PROJECT"
    else
        # Create project
        PROJECT_OUTPUT=$(neonctl projects create --name "$PROJECT_NAME" --output json 2>/dev/null)
        PROJECT_ID=$(echo "$PROJECT_OUTPUT" | jq -r '.project.id')
        success "Project created: ${PROJECT_NAME} (ID: ${PROJECT_ID})"
    fi
    
    # Get connection string
    step "Getting connection string..."
    CONNECTION_STRING=$(neonctl connection-string "$PROJECT_ID" --database-name neondb 2>/dev/null || \
                        neonctl connection-string --project-id "$PROJECT_ID" 2>/dev/null)
    
    if [[ -z "$CONNECTION_STRING" ]]; then
        error "Could not get connection string"
        return 1
    fi
    
    success "Connection string retrieved"
    
    # Update .env.local
    update_env "DATABASE_URL" "$CONNECTION_STRING"
    
    success "Neon credentials saved to .env.local"
    
    # Run initial migration
    step "Running database migrations..."
    pnpm db:push 2>/dev/null || warn "Could not run migrations automatically. Run 'pnpm db:push' manually."
    
    return 0
}

# =============================================================================
# Clerk Authentication
# =============================================================================
provision_clerk() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Clerk Authentication"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    info "Set up Clerk at https://dashboard.clerk.com"
    info "Create an application named '${APP_NAME}'"
    echo ""
    
    read -p "Enter NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (or press Enter to skip): " PUB_KEY
    if [[ -n "$PUB_KEY" ]]; then
        update_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$PUB_KEY"
        read -p "Enter CLERK_SECRET_KEY: " SECRET_KEY
        if [[ -n "$SECRET_KEY" ]]; then
            update_env "CLERK_SECRET_KEY" "$SECRET_KEY"
            success "Clerk credentials saved to .env.local"
        fi
    else
        warn "Skipping Clerk setup"
    fi
}

# =============================================================================
# Sentry Error Tracking
# =============================================================================
provision_sentry() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Sentry Error Tracking"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    info "Set up Sentry at https://sentry.io"
    info "Create a Next.js project named '${APP_NAME}'"
    echo ""
    
    read -p "Enter SENTRY_DSN (or press Enter to skip): " DSN
    if [[ -n "$DSN" ]]; then
        update_env "SENTRY_DSN" "$DSN"
        read -p "Enter SENTRY_AUTH_TOKEN (for source maps, optional): " AUTH
        if [[ -n "$AUTH" ]]; then
            update_env "SENTRY_AUTH_TOKEN" "$AUTH"
        fi
        success "Sentry credentials saved to .env.local"
    else
        warn "Skipping Sentry setup"
    fi
}

# =============================================================================
# PostHog Analytics
# =============================================================================
provision_posthog() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  PostHog Analytics"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    info "Set up PostHog at https://app.posthog.com"
    info "Create a project named '${APP_NAME}'"
    echo ""
    
    read -p "Enter NEXT_PUBLIC_POSTHOG_KEY (or press Enter to skip): " KEY
    if [[ -n "$KEY" ]]; then
        update_env "NEXT_PUBLIC_POSTHOG_KEY" "$KEY"
        
        read -p "Enter NEXT_PUBLIC_POSTHOG_HOST (default: https://app.posthog.com): " HOST
        if [[ -n "$HOST" ]]; then
            update_env "NEXT_PUBLIC_POSTHOG_HOST" "$HOST"
        else
            update_env "NEXT_PUBLIC_POSTHOG_HOST" "https://app.posthog.com"
        fi
        success "PostHog credentials saved to .env.local"
    else
        warn "Skipping PostHog setup"
    fi
}

# =============================================================================
# Stripe Payments
# =============================================================================
provision_stripe() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Stripe Payments"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    info "Set up Stripe at https://dashboard.stripe.com"
    info "Use test mode keys for development"
    echo ""
    
    read -p "Enter NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (or press Enter to skip): " PUB_KEY
    if [[ -n "$PUB_KEY" ]]; then
        update_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$PUB_KEY"
        
        read -p "Enter STRIPE_SECRET_KEY: " SECRET_KEY
        if [[ -n "$SECRET_KEY" ]]; then
            update_env "STRIPE_SECRET_KEY" "$SECRET_KEY"
        fi
        
        read -p "Enter STRIPE_WEBHOOK_SECRET (optional): " WEBHOOK
        if [[ -n "$WEBHOOK" ]]; then
            update_env "STRIPE_WEBHOOK_SECRET" "$WEBHOOK"
        fi
        
        success "Stripe credentials saved to .env.local"
    else
        warn "Skipping Stripe setup"
    fi
}

# =============================================================================
# Run Provisioning
# =============================================================================

if [[ "$PROVISION_NEON" == true ]]; then
    provision_neon || true
fi

if [[ "$PROVISION_CLERK" == true ]]; then
    provision_clerk || true
fi

if [[ "$PROVISION_SENTRY" == true ]]; then
    provision_sentry || true
fi

if [[ "$PROVISION_POSTHOG" == true ]]; then
    provision_posthog || true
fi

# Always offer Stripe
provision_stripe || true

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   Provisioning Complete! 🎉                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Show which env vars are set
info "Environment variables status:"
echo ""

check_env() {
    local key=$1
    local label=$2
    if grep -q "^${key}=.\+" "$ENV_FILE" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} ${label}"
    else
        echo -e "  ${RED}✗${NC} ${label} (not set)"
    fi
}

check_env "DATABASE_URL" "Neon Database URL"
check_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "Clerk Publishable Key"
check_env "CLERK_SECRET_KEY" "Clerk Secret Key"
check_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "Stripe Publishable Key"
check_env "STRIPE_SECRET_KEY" "Stripe Secret Key"
check_env "NEXT_PUBLIC_POSTHOG_KEY" "PostHog Key"
check_env "SENTRY_DSN" "Sentry DSN"

echo ""
info "Start development with: ${YELLOW}pnpm dev${NC}"
echo ""
