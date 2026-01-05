#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${BLUE}i${NC} $1"; }
success() { echo -e "${GREEN}+${NC} $1"; }
warn() { echo -e "${YELLOW}!${NC} $1"; }
error() { echo -e "${RED}x${NC} $1"; exit 1; }
step() { echo -e "${CYAN}>${NC} $1"; }

APP_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "app")
SAFE_NAME=$(echo "$APP_NAME" | sed 's/@//g' | sed 's/\//-/g')

NGROK_DOMAIN=""
USE_EXPO_GO=false
BUILD_DEV_CLIENT=false
USE_BETA=false
BETA_URL=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            NGROK_DOMAIN="$2"
            shift 2
            ;;
        --expo-go)
            USE_EXPO_GO=true
            shift
            ;;
        --dev-client)
            BUILD_DEV_CLIENT=true
            shift
            ;;
        --beta)
            USE_BETA=true
            if [[ -n "$2" && ! "$2" =~ ^-- ]]; then
                BETA_URL="$2"
                shift 2
            else
                shift
            fi
            ;;
        --help|-h)
            echo ""
            echo "Mobile Development Script"
            echo ""
            echo "Usage: ./scripts/dev-mobile.sh [options]"
            echo ""
            echo "Options:"
            echo "  --beta [URL]      Use beta environment (default: beta.\${project}.gmac.io)"
            echo "                    Skips local Next.js and ngrok, connects to remote API"
            echo "  --domain NAME     Use a static ngrok domain (NAME.ngrok.app)"
            echo "  --expo-go         Use Expo Go (limited native modules)"
            echo "  --dev-client      Build development client first"
            echo "  --help, -h        Show this help"
            echo ""
            echo "Examples:"
            echo "  ./scripts/dev-mobile.sh                    # Local dev with ngrok tunnel"
            echo "  ./scripts/dev-mobile.sh --beta             # Connect to beta.myapp.gmac.io"
            echo "  ./scripts/dev-mobile.sh --beta https://custom.api.com"
            echo ""
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

NEXT_LOG="/tmp/${SAFE_NAME}-next.log"
NGROK_LOG="/tmp/${SAFE_NAME}-ngrok.log"

echo ""
echo "Mobile Development Environment"
echo "==============================="
echo ""

if [[ "$USE_BETA" == true ]]; then
    if [[ -z "$BETA_URL" ]]; then
        PROJECT_NAME=$(echo "$SAFE_NAME" | sed 's/-app$//' | sed 's/vercel-//')
        BETA_URL="https://beta.${PROJECT_NAME}.gmac.io"
    fi
    
    step "Using beta environment: ${BETA_URL}"
    
    if ! curl -s --head --connect-timeout 5 "${BETA_URL}/api/health" >/dev/null 2>&1; then
        warn "Beta API may not be reachable. Continuing anyway..."
    else
        success "Beta API is reachable"
    fi
    
    API_URL="$BETA_URL"
    
    echo ""
    echo "---"
    echo -e "${GREEN}Beta environment ready!${NC}"
    echo "---"
    echo ""
    echo -e "${BLUE}API:${NC}   ${API_URL}"
    echo -e "${BLUE}tRPC:${NC} ${API_URL}/api/trpc"
    echo ""
    
    step "Starting Expo..."
    echo -e "EXPO_PUBLIC_API_URL=${API_URL}"
    echo ""
    
    if [[ "$USE_EXPO_GO" == true ]]; then
        info "Using Expo Go - some native modules may not work"
        echo ""
    fi
    
    echo -e "${YELLOW}Scan the QR code with your phone camera (iOS) or Expo Go app (Android)${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    cd apps/mobile
    if [[ "$USE_EXPO_GO" == true ]]; then
        EXPO_PUBLIC_API_URL="$API_URL" npx expo start --tunnel --go
    else
        EXPO_PUBLIC_API_URL="$API_URL" npx expo start --tunnel
    fi
    exit 0
fi

if ! command -v ngrok &> /dev/null; then
    error "ngrok is not installed. Install with: brew install ngrok"
fi

if ! command -v jq &> /dev/null; then
    error "jq is not installed. Install with: brew install jq"
fi

if ! ngrok config check &> /dev/null 2>&1; then
    warn "ngrok may not be authenticated"
    info "Get your auth token at: https://dashboard.ngrok.com/get-started/your-authtoken"
    info "Then run: ngrok authtoken YOUR_TOKEN"
    echo ""
fi

NEXT_PID=""
NGROK_PID=""

cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"
    
    [ -n "$NEXT_PID" ] && kill $NEXT_PID 2>/dev/null || true
    [ -n "$NGROK_PID" ] && kill $NGROK_PID 2>/dev/null || true
    
    rm -f "$NEXT_LOG" "$NGROK_LOG"
    
    echo -e "${GREEN}Goodbye!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

if [[ "$BUILD_DEV_CLIENT" == true ]]; then
    step "Building development client..."
    info "This will build a custom Expo dev client with your native modules"
    echo ""
    
    read -p "Build for which platform? (ios/android/both) " PLATFORM
    
    case $PLATFORM in
        ios)
            eas build --profile development --platform ios
            ;;
        android)
            eas build --profile development --platform android
            ;;
        both)
            eas build --profile development --platform all
            ;;
        *)
            warn "Skipping dev client build"
            ;;
    esac
    echo ""
fi

step "Starting Next.js server..."
> "$NEXT_LOG"

WEB_FILTER=$(node -p "require('./package.json').name.replace(/^@/, '@').split('/')[0] + '/web'" 2>/dev/null || echo "web")

pnpm --filter "*web*" dev > "$NEXT_LOG" 2>&1 &
NEXT_PID=$!

NEXT_PORT=""
for i in {1..60}; do
    NEXT_PORT=$(grep -oE 'Local:[[:space:]]*http://localhost:[0-9]+' "$NEXT_LOG" 2>/dev/null | grep -oE '[0-9]+$' | head -1)
    if [ -n "$NEXT_PORT" ]; then
        break
    fi
    sleep 1
done

if [ -z "$NEXT_PORT" ]; then
    error "Next.js failed to start. Check logs: $NEXT_LOG"
fi

success "Next.js running on port ${NEXT_PORT}"

step "Starting ngrok tunnel..."

if [ -n "$NGROK_DOMAIN" ]; then
    NGROK_URL="https://${NGROK_DOMAIN}.ngrok.app"
    ngrok http "$NEXT_PORT" --url="$NGROK_URL" --log=stdout > "$NGROK_LOG" 2>&1 &
else
    ngrok http "$NEXT_PORT" --log=stdout --log-format=json > "$NGROK_LOG" 2>&1 &
fi
NGROK_PID=$!

API_URL=""
for i in {1..30}; do
    if [ -n "$NGROK_DOMAIN" ]; then
        if curl -s --head "https://${NGROK_DOMAIN}.ngrok.app" >/dev/null 2>&1; then
            API_URL="https://${NGROK_DOMAIN}.ngrok.app"
            break
        fi
    else
        API_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url // empty' 2>/dev/null)
        if [ -n "$API_URL" ]; then
            break
        fi
    fi
    sleep 1
done

if [ -z "$API_URL" ]; then
    error "ngrok tunnel failed to start. Check logs: $NGROK_LOG"
fi

success "API tunnel: ${API_URL}"

echo ""
echo "---"
echo -e "${GREEN}Development environment ready!${NC}"
echo "---"
echo ""
echo -e "${BLUE}Web App:${NC}      http://localhost:${NEXT_PORT}"
echo -e "${BLUE}API Tunnel:${NC}   ${API_URL}"
echo -e "${BLUE}tRPC:${NC}         ${API_URL}/api/trpc"
echo ""

step "Starting Expo..."
echo -e "EXPO_PUBLIC_API_URL=${API_URL}"
echo ""

if [[ "$USE_EXPO_GO" == true ]]; then
    info "Using Expo Go - some native modules may not work"
    echo ""
fi

echo -e "${YELLOW}Scan the QR code with your phone camera (iOS) or Expo Go app (Android)${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

cd apps/mobile
if [[ "$USE_EXPO_GO" == true ]]; then
    EXPO_PUBLIC_API_URL="$API_URL" npx expo start --tunnel --go
else
    EXPO_PUBLIC_API_URL="$API_URL" npx expo start --tunnel
fi
