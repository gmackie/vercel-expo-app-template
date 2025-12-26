#!/bin/bash
set -e

# =============================================================================
# Template Setup Script
# =============================================================================
# This script renames the template to your new app name and optionally removes
# the mobile app if you don't need it.
#
# Usage: ./scripts/setup.sh <app-name> [--no-mobile]
#
# Examples:
#   ./scripts/setup.sh my-saas-app
#   ./scripts/setup.sh my-web-app --no-mobile
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print with color
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Validate app name (lowercase, alphanumeric, hyphens only)
validate_name() {
    if [[ ! "$1" =~ ^[a-z][a-z0-9-]*$ ]]; then
        error "App name must start with a letter and contain only lowercase letters, numbers, and hyphens"
    fi
    if [[ ${#1} -lt 2 || ${#1} -gt 50 ]]; then
        error "App name must be between 2 and 50 characters"
    fi
}

# Parse arguments
APP_NAME=""
INCLUDE_MOBILE=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-mobile)
            INCLUDE_MOBILE=false
            shift
            ;;
        --help|-h)
            echo "Usage: ./scripts/setup.sh <app-name> [--no-mobile]"
            echo ""
            echo "Options:"
            echo "  --no-mobile    Remove the mobile app from the monorepo"
            echo "  --help, -h     Show this help message"
            exit 0
            ;;
        *)
            if [[ -z "$APP_NAME" ]]; then
                APP_NAME="$1"
            else
                error "Unknown argument: $1"
            fi
            shift
            ;;
    esac
done

# Validate inputs
if [[ -z "$APP_NAME" ]]; then
    error "App name is required. Usage: ./scripts/setup.sh <app-name> [--no-mobile]"
fi

validate_name "$APP_NAME"

# Derive package scope from app name
PACKAGE_SCOPE="@${APP_NAME}"
OLD_SCOPE="@repo"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    Template Setup Script                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
info "App Name: ${APP_NAME}"
info "Package Scope: ${PACKAGE_SCOPE}"
info "Include Mobile: ${INCLUDE_MOBILE}"
echo ""

# Confirm before proceeding
read -p "Proceed with setup? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Setup cancelled"
    exit 0
fi

echo ""

# -----------------------------------------------------------------------------
# Step 1: Remove mobile app if not needed
# -----------------------------------------------------------------------------
if [[ "$INCLUDE_MOBILE" == false ]]; then
    info "Removing mobile app..."
    
    # Remove mobile app directory
    rm -rf apps/mobile
    
    # Remove mobile from pnpm-workspace.yaml references
    # (apps/* already covers it, so no change needed there)
    
    # Remove mobile-specific packages if they exist
    # (analytics and monitoring have native exports, but they're optional)
    
    success "Mobile app removed"
fi

# -----------------------------------------------------------------------------
# Step 2: Rename package scope in all files
# -----------------------------------------------------------------------------
info "Renaming package scope from ${OLD_SCOPE} to ${PACKAGE_SCOPE}..."

# Files to update (excluding node_modules, .git, pnpm-lock.yaml)
find . -type f \( \
    -name "*.json" -o \
    -name "*.ts" -o \
    -name "*.tsx" -o \
    -name "*.js" -o \
    -name "*.mjs" -o \
    -name "*.cjs" -o \
    -name "*.md" \
\) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -name "pnpm-lock.yaml" -print0 | \
while IFS= read -r -d '' file; do
    if grep -q "${OLD_SCOPE}/" "$file" 2>/dev/null; then
        # Use different sed syntax for macOS vs Linux
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|${OLD_SCOPE}/|${PACKAGE_SCOPE}/|g" "$file"
        else
            sed -i "s|${OLD_SCOPE}/|${PACKAGE_SCOPE}/|g" "$file"
        fi
    fi
done

success "Package scope renamed"

# -----------------------------------------------------------------------------
# Step 3: Update root package.json name
# -----------------------------------------------------------------------------
info "Updating root package.json..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|\"name\": \"vercel-app\"|\"name\": \"${APP_NAME}\"|g" package.json
else
    sed -i "s|\"name\": \"vercel-app\"|\"name\": \"${APP_NAME}\"|g" package.json
fi

success "Root package.json updated"

# -----------------------------------------------------------------------------
# Step 4: Update app metadata (titles, descriptions)
# -----------------------------------------------------------------------------
info "Updating app metadata..."

# Update Next.js layout title
LAYOUT_FILE="apps/web/src/app/layout.tsx"
if [[ -f "$LAYOUT_FILE" ]]; then
    # Convert app-name to Title Case for display
    TITLE_CASE=$(echo "$APP_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|title: \"Vercel App\"|title: \"${TITLE_CASE}\"|g" "$LAYOUT_FILE"
        sed -i '' "s|description: \"Next.js + Expo Monorepo\"|description: \"${TITLE_CASE}\"|g" "$LAYOUT_FILE"
    else
        sed -i "s|title: \"Vercel App\"|title: \"${TITLE_CASE}\"|g" "$LAYOUT_FILE"
        sed -i "s|description: \"Next.js + Expo Monorepo\"|description: \"${TITLE_CASE}\"|g" "$LAYOUT_FILE"
    fi
fi

# Update Expo app.json if mobile exists
if [[ -f "apps/mobile/app.json" ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|\"name\": \".*\"|\"name\": \"${APP_NAME}\"|g" "apps/mobile/app.json"
        sed -i '' "s|\"slug\": \".*\"|\"slug\": \"${APP_NAME}\"|g" "apps/mobile/app.json"
    else
        sed -i "s|\"name\": \".*\"|\"name\": \"${APP_NAME}\"|g" "apps/mobile/app.json"
        sed -i "s|\"slug\": \".*\"|\"slug\": \"${APP_NAME}\"|g" "apps/mobile/app.json"
    fi
fi

# Update Expo app.config.js if mobile exists (for EAS builds)
APP_CONFIG="apps/mobile/app.config.js"
if [[ -f "$APP_CONFIG" ]]; then
    # Convert app-name to bundle ID format (com.company.appname)
    BUNDLE_ID="io.gmac.apps.${APP_NAME//-/}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|const APP_NAME = \".*\"|const APP_NAME = \"${TITLE_CASE}\"|g" "$APP_CONFIG"
        sed -i '' "s|const APP_SLUG = \".*\"|const APP_SLUG = \"${APP_NAME}\"|g" "$APP_CONFIG"
        sed -i '' "s|const BUNDLE_ID_BASE = \".*\"|const BUNDLE_ID_BASE = \"${BUNDLE_ID}\"|g" "$APP_CONFIG"
    else
        sed -i "s|const APP_NAME = \".*\"|const APP_NAME = \"${TITLE_CASE}\"|g" "$APP_CONFIG"
        sed -i "s|const APP_SLUG = \".*\"|const APP_SLUG = \"${APP_NAME}\"|g" "$APP_CONFIG"
        sed -i "s|const BUNDLE_ID_BASE = \".*\"|const BUNDLE_ID_BASE = \"${BUNDLE_ID}\"|g" "$APP_CONFIG"
    fi
    
    warn "Remember to update PROJECT_ID in apps/mobile/app.config.js after running 'eas init'"
fi

success "App metadata updated"

# -----------------------------------------------------------------------------
# Step 5: Update vercel.json
# -----------------------------------------------------------------------------
info "Updating vercel.json..."

if [[ -f "vercel.json" ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|${OLD_SCOPE}/web|${PACKAGE_SCOPE}/web|g" "vercel.json"
    else
        sed -i "s|${OLD_SCOPE}/web|${PACKAGE_SCOPE}/web|g" "vercel.json"
    fi
fi

success "vercel.json updated"

# -----------------------------------------------------------------------------
# Step 6: Create .env.local from .env.example
# -----------------------------------------------------------------------------
if [[ ! -f ".env.local" ]] && [[ -f ".env.example" ]]; then
    info "Creating .env.local from .env.example..."
    cp .env.example .env.local
    success ".env.local created (remember to fill in your values!)"
else
    warn ".env.local already exists, skipping"
fi

# -----------------------------------------------------------------------------
# Step 7: Clean up and reinstall
# -----------------------------------------------------------------------------
info "Cleaning up..."

# Remove pnpm-lock.yaml to regenerate with new package names
rm -f pnpm-lock.yaml

# Remove node_modules
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm -rf tooling/*/node_modules

success "Cleaned up old dependencies"

info "Installing dependencies..."
pnpm install

success "Dependencies installed"

# -----------------------------------------------------------------------------
# Step 8: Initialize git (optional)
# -----------------------------------------------------------------------------
if [[ -d ".git" ]]; then
    info "Removing template git history..."
    rm -rf .git
    git init
    git add .
    git commit -m "Initial commit: ${APP_NAME}"
    success "Fresh git repository initialized"
fi

# -----------------------------------------------------------------------------
# Done!
# -----------------------------------------------------------------------------
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                       Setup Complete! 🎉                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
success "Your app '${APP_NAME}' is ready!"
echo ""
info "Next steps:"
echo "  1. Run the provisioning script to set up external services:"
echo "     ${YELLOW}./scripts/provision.sh${NC}"
echo ""
echo "  2. Or manually add your API keys to .env.local:"
echo "     - Turso: https://turso.tech"
echo "     - Clerk: https://clerk.com"
echo "     - Stripe: https://stripe.com"
echo "     - PostHog: https://posthog.com"
echo "     - Sentry: https://sentry.io"
echo ""
echo "  3. Start the development server:"
echo "     ${YELLOW}pnpm dev${NC}"
echo ""
