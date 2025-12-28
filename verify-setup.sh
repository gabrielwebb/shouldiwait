#!/bin/bash

echo "🔍 Should I Wait? - Setup Verification"
echo "======================================"
echo ""

# Check .env.local
echo "📝 Checking environment variables..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found"
    exit 1
fi

if grep -q "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_" .env.local; then
    echo "✅ Clerk publishable key configured"
else
    echo "❌ Clerk publishable key missing"
fi

if grep -q "EXPO_PUBLIC_CONVEX_URL=https://courteous-wombat-541.convex.cloud" .env.local; then
    echo "✅ Convex URL configured"
else
    echo "❌ Convex URL missing"
fi

echo ""
echo "📁 Checking project structure..."
[ -f "convex/auth.config.ts" ] && echo "✅ Convex auth config created" || echo "❌ convex/auth.config.ts missing"
[ -f "convex/schema.ts" ] && echo "✅ Database schema defined" || echo "❌ convex/schema.ts missing"
[ -f "convex/locations.ts" ] && echo "✅ Locations functions created" || echo "❌ convex/locations.ts missing"
[ -f "convex/ratings.ts" ] && echo "✅ Ratings functions created" || echo "❌ convex/ratings.ts missing"
[ -f "convex/photos.ts" ] && echo "✅ Photos functions created" || echo "❌ convex/photos.ts missing"

echo ""
echo "🔐 Auth Configuration Summary:"
echo "  Clerk Domain: arriving-rabbit-65.clerk.accounts.dev"
echo "  Convex Deployment: courteous-wombat-541.convex.cloud"
echo ""

echo "📋 Next Steps:"
echo "1. Run Convex dev (in Terminal 1):"
echo "   npx convex dev"
echo ""
echo "2. Start Expo dev server (in Terminal 2):"
echo "   npm start"
echo ""
echo "3. Press 'i' for iOS simulator or 'a' for Android emulator"
echo ""
