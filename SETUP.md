# Setup Instructions

## Current Status

Your **Should I Wait?** project has been bootstrapped with all necessary configuration files and project structure. Here's what's been set up:

### ✅ Completed
- Package.json with all dependencies installed (1,439 packages)
- Expo configuration (app.json) with deep linking and permissions
- TypeScript configuration
- Convex schema and backend functions
- Basic app structure with Expo Router
- Environment file template (.env.local)
- Git ignore patterns

### ⏳ Manual Steps Required

Since Convex requires interactive authentication, you'll need to complete these steps manually:

## 1. Initialize Convex (Required)

Convex needs to be initialized interactively to create your cloud deployment:

```bash
npx convex dev
```

This will:
1. Prompt you to login/create a Convex account
2. Create a new Convex project
3. Generate your `EXPO_PUBLIC_CONVEX_URL`
4. Push the schema to the cloud
5. Generate TypeScript types in `convex/_generated/`

**Important**: Copy the generated Convex URL to your `.env.local` file:
```bash
EXPO_PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
```

## 2. Set Up Clerk Authentication (Required)

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Go to API Keys section
4. Copy your **Publishable Key** (starts with `pk_test_...`)
5. Add it to `.env.local`:
   ```bash
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

## 3. Configure Clerk in Convex Dashboard

After initializing Convex and setting up Clerk:

1. Go to your Convex Dashboard → Settings → Authentication
2. Click "Add Auth Provider"
3. Select "Clerk"
4. In Clerk Dashboard, go to JWT Templates
5. Create a new "Convex" template
6. Copy the issuer domain (format: `https://your-app.clerk.accounts.dev`)
7. In Convex Dashboard, set environment variable:
   ```
   CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
   ```

## 4. Start Development Server

Once Convex is initialized and environment variables are set:

```bash
# Terminal 1: Start Convex development server
npx convex dev

# Terminal 2: Start Expo development server
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors about missing `_generated` files, it means Convex hasn't been initialized yet. Run `npx convex dev` first.

### Environment Variable Errors

If the app throws errors about missing environment variables:
1. Verify `.env.local` exists in the project root
2. Ensure both `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and `EXPO_PUBLIC_CONVEX_URL` are set
3. Restart the development server after updating `.env.local`

### Authentication Loop Issues

If you experience authentication loops:
- Verify the `tokenCache` is configured in `app/_layout.tsx` (already done)
- Check that Clerk JWT template is properly configured for Convex
- Ensure `CLERK_JWT_ISSUER_DOMAIN` is set in Convex Dashboard

## Next Steps After Setup

Once the development server is running:

1. **Implement Nearby Bathrooms Feature** (first feature in spec)
   - Location permissions
   - Map view with react-native-maps
   - Convex queries for nearby locations
   - Deep linking to native maps

2. **Test Authentication Flow**
   - Add sign-in/sign-up screens
   - Test OAuth providers (Google, Apple)
   - Verify Convex user-scoped queries

3. **Add Sample Data**
   - Create seed script for test locations
   - Add sample ratings and reviews

## Reference Documentation

- Project spec: `/spec/spec-sheet.md`
- Implementation patterns: `/agents/` directory
- Development skills: `/skills/` directory
- Critical patterns: `/CLAUDE.md`
