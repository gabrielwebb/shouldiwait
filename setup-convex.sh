#!/bin/bash

# Setup Convex Helper Script
# Run this from the project root directory

echo "🚀 Convex Setup Helper"
echo "======================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the project root directory:"
    echo "  cd /Users/gabrielwebb/Desktop/shouldiwait"
    echo "  bash setup-convex.sh"
    exit 1
fi

echo "✅ Found package.json"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
else
    echo "✅ Found .env.local"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Run Convex initialization:"
echo "   npx convex dev"
echo ""
echo "   This will:"
echo "   - Prompt you to login/create a Convex account"
echo "   - Create a new Convex project"
echo "   - Generate your EXPO_PUBLIC_CONVEX_URL"
echo "   - Push the schema to the cloud"
echo ""
echo "2. After Convex initializes, copy the deployment URL to .env.local:"
echo "   EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud"
echo ""
echo "3. Set up Clerk authentication:"
echo "   - Go to https://clerk.com"
echo "   - Create an account and application"
echo "   - Copy publishable key to .env.local:"
echo "     EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_..."
echo ""
echo "4. Configure Clerk in Convex Dashboard:"
echo "   - Convex Dashboard → Settings → Authentication"
echo "   - Add Clerk as provider"
echo "   - Set CLERK_JWT_ISSUER_DOMAIN environment variable"
echo ""
echo "Ready to initialize Convex? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "🎯 Starting Convex initialization..."
    npx convex dev
else
    echo ""
    echo "💡 Run 'npx convex dev' when you're ready to initialize Convex"
fi
