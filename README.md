# Should I Wait?

An Expo React Native app that helps users find clean bathrooms nearby using location-based search and community cleanliness ratings.

## Features

- **Nearby Bathrooms**: Location-based search with map/list view, filtering, and native navigation
- **Cleanliness Insights**: Historical trends, peak clean/dirty times, and time-based summaries
- **Ratings & Reviews**: User-submitted cleanliness ratings, reviews, and photo uploads

## Tech Stack

- **Frontend**: Expo (React Native for iOS & Android)
- **Backend**: Convex (real-time queries, scheduled jobs, Storage API)
- **Authentication**: Clerk
- **Location**: Expo Location
- **Maps**: react-native-maps
- **Navigation**: Deep links to Apple Maps/Google Maps

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Convex CLI (`npm install -g convex`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd shouldiwait
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.local` from the example:
   ```bash
   cp .env.local.example .env.local
   ```

   Add your keys:
   ```bash
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
   EXPO_PUBLIC_CONVEX_URL=https://***your-deployment***.convex.cloud
   ```

4. **Initialize Convex**
   ```bash
   npx convex dev
   ```

   This will:
   - Create a new Convex project (or link to existing)
   - Generate the Convex URL for `.env.local`
   - Start the Convex development server
   - Push your schema to the cloud

5. **Configure Clerk Authentication**

   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy the publishable key to `.env.local`
   - In Convex Dashboard → Settings → Authentication:
     - Add Clerk as provider
     - Set `CLERK_JWT_ISSUER_DOMAIN` environment variable

6. **Start the development server**
   ```bash
   npm start
   ```

   Then:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser

## Project Structure

```
shouldiwait/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with providers
│   └── index.tsx          # Home screen
├── assets/                # Images, fonts, icons
├── components/            # React Native components
├── convex/                # Convex backend functions
│   ├── schema.ts          # Database schema
│   └── README.md          # Convex setup guide
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── constants/             # App constants
├── types/                 # TypeScript types
├── agents/                # Claude Code agent configs
├── skills/                # Reusable development skills
├── spec/                  # Project specification
│   └── spec-sheet.md      # Product requirements
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── CLAUDE.md              # Claude Code instructions

```

## Development Workflow

1. **Review the spec**: Read `/spec/spec-sheet.md` for requirements
2. **Check agents**: Reference `/agents/` for implementation patterns
3. **Use skills**: Apply skills from `/skills/` for TDD, iOS design, etc.
4. **Follow CLAUDE.md**: Critical patterns for Clerk, Convex, and Expo

## Testing

```bash
npm test
```

## Building for Production

### Prerequisites
- EAS CLI: `npm install -g eas-cli`
- EAS account: `eas login`

### Configure EAS Build
```bash
eas build:configure
```

### Build
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# Both
eas build --platform all --profile production
```

### Submit to App Stores
```bash
eas submit --platform ios
eas submit --platform android
```

### OTA Updates
```bash
eas update --branch production --message "Bug fixes"
```

## Key Principles

- **Cross-platform first**: Handle iOS/Android/web with Platform.OS checks
- **Authentication security**: Use SecureStore token cache
- **Real-time data**: Leverage Convex subscriptions
- **Type safety**: TypeScript throughout
- **Test-driven**: Write tests before implementation

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://clerk.com/docs)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

## License

MIT
