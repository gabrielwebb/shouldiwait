# Quick Start Guide

You're seeing an error trying to run Convex. Here's how to fix it:

## The Error You're Seeing

```
✖ Unable to read your package.json: Error: ENOENT: no such file or directory
```

This happens when you're not in the correct directory.

## Solution

### Option 1: Use the Helper Script (Recommended)

```bash
# Make sure you're in the project directory
cd /Users/gabrielwebb/Desktop/shouldiwait

# Run the setup helper
bash setup-convex.sh
```

### Option 2: Manual Setup

1. **Ensure you're in the project directory:**
   ```bash
   cd /Users/gabrielwebb/Desktop/shouldiwait
   pwd  # Should output: /Users/gabrielwebb/Desktop/shouldiwait
   ```

2. **Verify package.json exists:**
   ```bash
   ls package.json  # Should show: package.json
   ```

3. **Run Convex initialization:**
   ```bash
   npx convex dev
   ```

4. **Follow the prompts:**
   - Login or create a Convex account
   - Choose "Create a new project" or link to existing
   - Wait for it to generate your deployment URL

5. **Copy the Convex URL:**
   ```bash
   # It will look like: https://your-name-123.convex.cloud
   # Add it to .env.local:
   nano .env.local
   # or
   code .env.local
   ```

6. **Update .env.local:**
   ```bash
   EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

## What Happens Next?

Once Convex is initialized:

1. ✅ Your Convex deployment will be created
2. ✅ Database schema will be pushed to the cloud
3. ✅ TypeScript types will be generated in `convex/_generated/`
4. ✅ Development server will start watching for changes

## Then Set Up Clerk

1. Go to https://clerk.com
2. Create an account and new application
3. Copy the publishable key (starts with `pk_test_`)
4. Add to `.env.local`:
   ```bash
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

## Finally, Start the App

```bash
# Terminal 1: Keep Convex running
npx convex dev

# Terminal 2: Start Expo
npm start
```

## Still Having Issues?

Make sure:
- ✅ You're running commands from `/Users/gabrielwebb/Desktop/shouldiwait`
- ✅ `package.json` exists in the directory
- ✅ You ran `npm install` successfully
- ✅ You have internet connection for Convex login

## Need Help?

Check these files for more details:
- `SETUP.md` - Complete setup instructions
- `README.md` - Full project documentation
- `convex/README.md` - Convex-specific setup
