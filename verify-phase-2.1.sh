#!/bin/bash

# Phase 2.1 Verification Script
# Checks that all files are in place and configuration is correct

echo "🔍 Verifying Phase 2.1 - Location Services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track success/failure
ALL_GOOD=true

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 (MISSING)"
        ALL_GOOD=false
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
    else
        echo -e "${RED}✗${NC} $1/ (MISSING)"
        ALL_GOOD=false
    fi
}

# Function to check for string in file
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
    else
        echo -e "${RED}✗${NC} $3 (NOT FOUND)"
        ALL_GOOD=false
    fi
}

echo "📁 Core Files:"
check_file "package.json"
check_file "app.json"
check_file "tsconfig.json"
check_file "babel.config.js"
check_file ".env.local"
check_file ".convexignore"
echo ""

echo "📂 Project Structure:"
check_dir "app"
check_dir "convex"
check_dir "hooks"
check_dir "components"
check_dir ".claude"
echo ""

echo "🔧 Phase 2.1 Implementation Files:"
check_file "hooks/useLocation.ts"
check_file "components/LocationPermissionPrompt.tsx"
check_file "app/index.tsx"
check_file "app/_layout.tsx"
echo ""

echo "📚 Documentation:"
check_file "README.md"
check_file "TESTING.md"
check_file "PROGRESS.md"
check_file "START.md"
check_file "STATUS.md"
check_file "UI_IMPROVEMENTS.md"
check_file "PROJECT_LOG.md"
check_file "PHASE_2.1_COMPLETE.md"
echo ""

echo "📦 Dependencies Installed:"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules/"

    # Check for critical packages
    if [ -d "node_modules/expo" ]; then
        echo -e "${GREEN}✓${NC} expo"
    else
        echo -e "${RED}✗${NC} expo (run npm install)"
        ALL_GOOD=false
    fi

    if [ -d "node_modules/@clerk/clerk-expo" ]; then
        echo -e "${GREEN}✓${NC} @clerk/clerk-expo"
    else
        echo -e "${RED}✗${NC} @clerk/clerk-expo (run npm install)"
        ALL_GOOD=false
    fi

    if [ -d "node_modules/convex" ]; then
        echo -e "${GREEN}✓${NC} convex"
    else
        echo -e "${RED}✗${NC} convex (run npm install)"
        ALL_GOOD=false
    fi

    if [ -d "node_modules/expo-location" ]; then
        echo -e "${GREEN}✓${NC} expo-location"
    else
        echo -e "${RED}✗${NC} expo-location (run npm install)"
        ALL_GOOD=false
    fi

    if [ -d "node_modules/react-native-safe-area-context" ]; then
        echo -e "${GREEN}✓${NC} react-native-safe-area-context"
    else
        echo -e "${RED}✗${NC} react-native-safe-area-context (run npm install)"
        ALL_GOOD=false
    fi

    if [ -d "node_modules/babel-plugin-module-resolver" ]; then
        echo -e "${GREEN}✓${NC} babel-plugin-module-resolver"
    else
        echo -e "${RED}✗${NC} babel-plugin-module-resolver (run npm install)"
        ALL_GOOD=false
    fi
else
    echo -e "${RED}✗${NC} node_modules/ (run npm install)"
    ALL_GOOD=false
fi
echo ""

echo "🔐 Environment Variables:"
if [ -f ".env.local" ]; then
    check_content ".env.local" "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY" "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"
    check_content ".env.local" "EXPO_PUBLIC_CONVEX_URL" "EXPO_PUBLIC_CONVEX_URL"
    check_content ".env.local" "CONVEX_DEPLOYMENT" "CONVEX_DEPLOYMENT"
else
    echo -e "${RED}✗${NC} .env.local (MISSING)"
    ALL_GOOD=false
fi
echo ""

echo "⚙️  TypeScript Configuration:"
check_content "tsconfig.json" "baseUrl" "baseUrl configured"
check_content "tsconfig.json" "@/hooks" "Path aliases configured"
echo ""

echo "⚙️  Babel Configuration:"
check_content "babel.config.js" "module-resolver" "module-resolver plugin"
check_content "babel.config.js" "@/hooks" "Babel aliases configured"
echo ""

echo "🚫 Convex Ignore Configuration:"
check_content ".convexignore" "app/" ".convexignore excludes app/"
check_content ".convexignore" "components/" ".convexignore excludes components/"
check_content ".convexignore" "hooks/" ".convexignore excludes hooks/"
echo ""

echo "🎨 iOS Design Implementation:"
check_content "components/LocationPermissionPrompt.tsx" "useColorScheme" "Dark mode support"
check_content "components/LocationPermissionPrompt.tsx" "SafeAreaView" "SafeAreaView integration"
check_content "components/LocationPermissionPrompt.tsx" "accessibilityLabel" "Accessibility labels"
check_content "app/index.tsx" "useColorScheme" "Dark mode in home screen"
check_content "app/index.tsx" "SafeAreaView" "SafeAreaView in home screen"
echo ""

echo "🗄️  Convex Backend:"
if [ -d "convex/_generated" ]; then
    echo -e "${GREEN}✓${NC} convex/_generated/ (types generated)"
else
    echo -e "${YELLOW}⚠${NC}  convex/_generated/ (run: npx convex dev)"
fi
check_file "convex/schema.ts"
check_file "convex/auth.config.ts"
check_file "convex/locations.ts"
check_file "convex/ratings.ts"
check_file "convex/photos.ts"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✅ Phase 2.1 Verification: PASSED${NC}"
    echo ""
    echo "🎉 Everything looks good! You're ready to run the app."
    echo ""
    echo "📋 Next Steps:"
    echo "1. Terminal 1: npx convex dev"
    echo "2. Terminal 2: npm start"
    echo "3. Press 'i' to open iOS Simulator"
    echo ""
    echo "📖 See START.md for detailed instructions"
else
    echo -e "${RED}❌ Phase 2.1 Verification: FAILED${NC}"
    echo ""
    echo "⚠️  Some files or configurations are missing."
    echo "Please review the errors above and fix them."
    echo ""
    echo "Common fixes:"
    echo "- Run: npm install"
    echo "- Run: npx convex dev"
    echo "- Check .env.local has all required keys"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
