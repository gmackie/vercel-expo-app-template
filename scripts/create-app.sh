#!/bin/bash
set -e

# =============================================================================
# Create New App from Template
# =============================================================================
# This is the main entry point for creating a new app. It:
# 1. Clones the template repository
# 2. Runs the setup script to rename everything
# 3. Optionally runs the provisioning script
#
# Usage: 
#   curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/template/main/scripts/create-app.sh | bash -s my-app
#   
#   Or locally:
#   ./scripts/create-app.sh my-app [options]
#
# Options:
#   --no-mobile      Don't include the mobile app
#   --no-provision   Skip the provisioning step
#   --template URL   Use a custom template repository
# =============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Default values
TEMPLATE_REPO="https://github.com/gmackie/vercel-expo-app-template.git"
INCLUDE_MOBILE=true
RUN_PROVISION=true
APP_NAME=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-mobile)
            INCLUDE_MOBILE=false
            shift
            ;;
        --no-provision)
            RUN_PROVISION=false
            shift
            ;;
        --template)
            TEMPLATE_REPO="$2"
            shift 2
            ;;
        --help|-h)
            echo ""
            echo "Create a new app from the template"
            echo ""
            echo "Usage: create-app.sh <app-name> [options]"
            echo ""
            echo "Options:"
            echo "  --no-mobile      Don't include the mobile app"
            echo "  --no-provision   Skip service provisioning"
            echo "  --template URL   Use a custom template repository"
            echo "  --help, -h       Show this help message"
            echo ""
            echo "Examples:"
            echo "  create-app.sh my-saas"
            echo "  create-app.sh my-web --no-mobile"
            echo "  create-app.sh my-app --no-provision"
            echo ""
            exit 0
            ;;
        -*)
            error "Unknown option: $1"
            ;;
        *)
            if [[ -z "$APP_NAME" ]]; then
                APP_NAME="$1"
            else
                error "Unexpected argument: $1"
            fi
            shift
            ;;
    esac
done

# Validate app name
if [[ -z "$APP_NAME" ]]; then
    echo ""
    echo -e "${BOLD}Create New App${NC}"
    echo ""
    read -p "Enter app name: " APP_NAME
    
    if [[ -z "$APP_NAME" ]]; then
        error "App name is required"
    fi
fi

# Validate name format
if [[ ! "$APP_NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
    error "App name must start with a letter and contain only lowercase letters, numbers, and hyphens"
fi

# Check if directory exists
if [[ -d "$APP_NAME" ]]; then
    error "Directory '$APP_NAME' already exists"
fi

# Interactive mode for options if not specified via flags
if [[ -t 0 ]]; then  # Check if running interactively
    if [[ "$INCLUDE_MOBILE" == true ]]; then
        read -p "Include mobile app? (Y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            INCLUDE_MOBILE=false
        fi
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      Creating New App                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
info "App Name: ${APP_NAME}"
info "Include Mobile: ${INCLUDE_MOBILE}"
info "Template: ${TEMPLATE_REPO}"
echo ""

# =============================================================================
# Step 1: Clone Template
# =============================================================================
info "Cloning template..."

git clone --depth 1 "$TEMPLATE_REPO" "$APP_NAME" 2>/dev/null || {
    # If git clone fails, try without --depth for older git versions
    git clone "$TEMPLATE_REPO" "$APP_NAME"
}

cd "$APP_NAME"

# Remove template git history
rm -rf .git

success "Template cloned"

# =============================================================================
# Step 2: Run Setup Script
# =============================================================================
info "Running setup..."

SETUP_ARGS="$APP_NAME"
if [[ "$INCLUDE_MOBILE" == false ]]; then
    SETUP_ARGS="$SETUP_ARGS --no-mobile"
fi

# Run setup script if it exists, otherwise do inline setup
if [[ -f "scripts/setup.sh" ]]; then
    chmod +x scripts/setup.sh
    ./scripts/setup.sh $SETUP_ARGS
else
    # Inline setup (in case setup.sh doesn't exist in template)
    info "Running inline setup..."
    
    # Replace @repo with @app-name
    find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" \) \
        ! -path "*/node_modules/*" -print0 | \
    while IFS= read -r -d '' file; do
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|@repo/|@${APP_NAME}/|g" "$file"
        else
            sed -i "s|@repo/|@${APP_NAME}/|g" "$file"
        fi
    done
    
    # Update root package.json
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|\"name\": \".*\"|\"name\": \"${APP_NAME}\"|" package.json
    else
        sed -i "s|\"name\": \".*\"|\"name\": \"${APP_NAME}\"|" package.json
    fi
    
    # Remove mobile if requested
    if [[ "$INCLUDE_MOBILE" == false ]] && [[ -d "apps/mobile" ]]; then
        rm -rf apps/mobile
    fi
    
    # Create .env.local
    if [[ -f ".env.example" ]] && [[ ! -f ".env.local" ]]; then
        cp .env.example .env.local
    fi
    
    # Install dependencies
    pnpm install
fi

success "Setup complete"

# =============================================================================
# Step 3: Initialize Git
# =============================================================================
info "Initializing git repository..."

git init
git add .
git commit -m "Initial commit: ${APP_NAME}"

success "Git repository initialized"

# =============================================================================
# Step 4: Provision Services (Optional)
# =============================================================================
if [[ "$RUN_PROVISION" == true ]]; then
    echo ""
    read -p "Would you like to provision services now? (Y/n) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        if [[ -f "scripts/provision.sh" ]]; then
            chmod +x scripts/provision.sh
            ./scripts/provision.sh
        else
            warn "Provisioning script not found, skipping"
        fi
    fi
fi

# =============================================================================
# Done!
# =============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    App Created Successfully! 🎉                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
success "Your app '${APP_NAME}' is ready!"
echo ""
info "Next steps:"
echo ""
echo "  1. Navigate to your app:"
echo -e "     ${YELLOW}cd ${APP_NAME}${NC}"
echo ""
echo "  2. Start development:"
echo -e "     ${YELLOW}pnpm dev${NC}"
echo ""
if [[ "$RUN_PROVISION" == false ]]; then
    echo "  3. Set up services when ready:"
    echo -e "     ${YELLOW}./scripts/provision.sh${NC}"
    echo ""
fi
echo "  📚 Documentation: https://your-docs-url.com"
echo ""
