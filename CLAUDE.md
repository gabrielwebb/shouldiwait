# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Should I Wait?** is an Expo React Native app (iOS & Android) that helps users find clean bathrooms nearby using location-based search and community cleanliness ratings.

### Core Features
- **Nearby Bathrooms**: Location-based search with map/list view, filtering by distance/amenities, and deep linking to Apple Maps/Google Maps for turn-by-turn navigation
- **Cleanliness Insights**: Historical cleanliness trends, peak clean/dirty times, and time-based summaries powered by Convex aggregations and scheduled functions
- **Ratings & Reviews**: User-submitted cleanliness ratings, reviews, and photo-backed votes with Clerk authentication and Convex Storage for media

### Tech Stack
- **Frontend**: Expo (React Native for iOS & Android)
- **Backend**: Convex (real-time queries, scheduled jobs, Storage API)
- **Authentication**: Clerk (Expo)
- **Location**: Expo Location
- **Maps**: react-native-maps (Apple/Google map tiles)
- **Navigation**: Native deep links to Apple Maps/Google Maps
- **Media Storage**: Convex Storage (photos with signed URLs/CDN)

### UI Design
Clean, map-first, minimal interface with color-coded cleanliness badges, simple filters, large tap targets for one-handed use, and photo-forward review cards.

## Repository Structure

This is a **Claude Code workspace** containing agents and skills but no application source code yet. The repository provides specialized configurations for developing the app:

- **`/agents/`**: Specialized Claude Code agent configurations with best practices
  - `agent-convex.md`: Clerk authentication with Expo + Convex integration patterns
  - `agent-expo.md`: Expo React Native best practices and cross-platform compatibility
  - `agent-deployment.md`: EAS Build and EAS Submit production deployment workflows

- **`/skills/`**: Reusable capabilities and workflows
  - Skills are domain-specific guides (TDD, iOS design, architecture, etc.)

- **`/spec/`**: Project specification
  - `spec-sheet.md`: Product requirements and technical architecture

## Critical Implementation Patterns

### Clerk Authentication with Convex

**Always use SecureStore token cache** to prevent authentication loops:
```typescript
import * as SecureStore from "expo-secure-store";

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("SecureStore getToken error:", error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("SecureStore saveToken error:", error);
    }
  },
};

<ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
  <ClerkLoaded>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  </ClerkLoaded>
</ClerkProvider>
```

**Protected routes** must use automatic redirects with `useAuth`:
```typescript
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function ProtectedScreen() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  return <ProtectedContent />;
}
```

**OAuth integration** requires complete flow handling:
```typescript
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
const { createdSessionId, signIn, signUp } = await startOAuthFlow();

if (createdSessionId) {
  await setActive({ session: createdSessionId });
} else if (signIn?.status === "complete") {
  await setActive({ session: signIn.createdSessionId });
} else if (signUp?.status === "complete") {
  await setActive({ session: signUp.createdSessionId });
}
```

**Environment variables**:
```bash
# .env.local
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_*****
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Convex Dashboard (NOT in .env)
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
```

**User-scoped Convex queries** must check authentication:
```typescript
// Always check getUserIdentity in Convex functions
const identity = await ctx.auth.getUserIdentity();
if (!identity) return []; // Empty results for queries
if (!identity) throw new Error("Unauthorized"); // Error for mutations

// Use identity.subject as user ID
const userRatings = await ctx.db
  .query("ratings")
  .filter(q => q.eq(q.field("userId"), identity.subject))
  .collect();
```

### Expo Cross-Platform Development

**Always use Platform.OS checks** for platform-specific code:
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Web-specific code
} else {
  // Native (iOS/Android) code
}

// Platform-specific imports
const Storage = Platform.select({
  web: () => require('./storage.web'),
  default: () => require('./storage.native'),
})();
```

**Font loading** must use splash screen management:
```typescript
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '@expo-google-fonts/space-grotesk';

SplashScreen.preventAutoHideAsync();

const [fontsLoaded] = useFonts({
  'Custom-Regular': require('./assets/fonts/Custom-Regular.ttf'),
});

useEffect(() => {
  if (fontsLoaded) SplashScreen.hideAsync();
}, [fontsLoaded]);

if (!fontsLoaded) return null;
```

**Environment variables** require `EXPO_PUBLIC_` prefix for client access:
```bash
# Client-accessible
EXPO_PUBLIC_API_URL=https://api.example.com

# Server-only (not accessible in client)
API_SECRET=secret123
```

### Location and Maps Integration

**Location permissions** require proper handling:
```typescript
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  // Handle permission denial
}

const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.Balanced,
});
```

**Deep linking to native maps**:
```typescript
import { Linking, Platform } from 'react-native';

const openMaps = (latitude: number, longitude: number, label: string) => {
  const url = Platform.select({
    ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
    android: `geo:0,0?q=${latitude},${longitude}(${label})`,
  });

  Linking.openURL(url);
};
```

### Convex Real-Time Patterns

**Scheduled functions** for cleanliness insights:
```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";

const crons = cronJobs();

crons.interval(
  "aggregate-cleanliness-trends",
  { hours: 1 }, // Run hourly
  internal.aggregations.updateTrends
);

export default crons;
```

**File uploads with Convex Storage**:
```typescript
// Generate upload URL
const uploadUrl = await generateUploadUrl();

// Upload file
const response = await fetch(uploadUrl, {
  method: "POST",
  headers: { "Content-Type": image.mimeType },
  body: image.data,
});

const { storageId } = await response.json();

// Save reference in database
await addPhotoMutation({ storageId, locationId });
```

**Real-time subscriptions**:
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Automatically updates when data changes
const locations = useQuery(api.locations.getNearby, {
  latitude,
  longitude,
  radiusMiles: 5,
});
```

## Development Workflow

Since this is a planning/configuration repository without source code:

1. **Review the spec**: Read `/spec/spec-sheet.md` for product requirements
2. **Check agent patterns**: Reference `/agents/` for implementation best practices
3. **Use skills**: Apply relevant skills from `/skills/` when implementing features
4. **Follow TDD**: Write tests first before implementation (see `skills/test-driven-development/`)

## Deployment

**Development builds**:
```bash
npx expo start              # Start development server
npx expo start --ios        # iOS only
npx expo start --android    # Android only
npx expo start --web        # Web only
```

**Production builds** (when source code exists):
```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Configure builds
eas build:configure

# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

**OTA Updates**:
```bash
eas update --branch production --message "Bug fixes"
```

## Key Principles

1. **Cross-platform first**: Always handle iOS, Android, and web differences with Platform.OS checks
2. **Authentication security**: Use SecureStore token cache, validate environment variables, handle OAuth flows completely
3. **Real-time data**: Leverage Convex subscriptions for live updates, use user-scoped queries
4. **Type safety**: Use TypeScript throughout, leverage Convex's generated types
5. **Performance**: Optimize bundle size, lazy load heavy components, use platform-specific code splitting
6. **User experience**: Follow Apple HIG for iOS, Material Design for Android, large tap targets, accessible design
7. **Test-driven**: Write tests before implementation to ensure behavior verification

## Important Notes

- This repository contains **configuration and planning files only** - no application source code yet
- Agent files (`/agents/`) contain critical patterns and anti-patterns - reference them during implementation
- All environment variables for Clerk/Convex must be properly configured before authentication will work
- Deep linking requires native app configuration in `app.json` for both iOS and Android
- Convex Storage provides CDN URLs - use `getUrl()` to fetch signed URLs for images
- OAuth flows require `expo-web-browser` and `WebBrowser.maybeCompleteAuthSession()` call
