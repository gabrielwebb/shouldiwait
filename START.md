# 🚀 Quick Start Guide

## First Time? Verify Setup

Run this first to check everything is configured:

```bash
./verify-phase-2.1.sh
```

This will verify:
- All files are present
- Dependencies are installed
- Environment variables are set
- TypeScript/Babel configuration is correct
- Convex backend is initialized

---

## Start Development

You need **TWO terminal windows** open:

### Terminal 1: Convex Backend
```bash
npx convex dev
```

**What this does:**
- Watches for changes to `convex/` files
- Pushes updates to cloud
- Regenerates TypeScript types
- Shows function logs

**Expected output:**
```
✔ Convex functions ready!
Watching for file changes...
```

---

### Terminal 2: Expo Dev Server
```bash
npm start
```

**Then press:**
- `i` - Open iOS Simulator
- `a` - Open Android Emulator
- `w` - Open in web browser
- `r` - Reload app
- `m` - Toggle menu

**Expected output:**
```
Metro waiting on exp://...
```

---

## ✅ Current Features

### Phase 2.1: Location Services (COMPLETE)

**What works:**
1. **Location Permissions**
   - Automatic permission check on launch
   - Beautiful permission request UI
   - "Open Settings" for denied permissions

2. **GPS Location**
   - Gets current coordinates
   - Shows accuracy (±meters)
   - Loading states
   - Error handling

3. **Permission States**
   - Not requested → Show prompt
   - Granted → Show location
   - Denied → Show settings link

**Test it:**
1. Launch app in simulator
2. Tap "Allow Location Access"
3. Grant permission in iOS alert
4. See your coordinates (default: San Francisco)

---

## 🐛 Troubleshooting

### "Cannot find module '@/hooks/useLocation'"
**Fix:** Already fixed in `tsconfig.json` with path aliases

### Convex types missing
**Fix:** Run `npx convex dev` - it generates types in `convex/_generated/`

### Metro bundler cache issues
```bash
npx expo start --clear
```

### Reset iOS Simulator
```bash
# In Simulator menu:
Device → Erase All Content and Settings
```

### Location not working
- Check Location Services are enabled in Simulator
- Features → Location → Custom Location or Apple Park

---

## 📁 Project Structure

```
shouldiwait/
├── app/
│   ├── _layout.tsx          # Root with Clerk + Convex providers
│   └── index.tsx            # Home screen with location
├── components/
│   └── LocationPermissionPrompt.tsx
├── hooks/
│   └── useLocation.ts       # Location permissions & GPS
├── convex/
│   ├── auth.config.ts       # Clerk authentication
│   ├── schema.ts            # Database schema
│   ├── locations.ts         # Location queries
│   ├── ratings.ts           # Rating functions
│   └── photos.ts            # Photo uploads
└── .env.local               # Environment variables ✅ CONFIGURED
```

---

## 🎯 Next: Phase 2.2 - Map View

To continue development:
1. Get Google Maps API keys (iOS & Android)
2. Add to `app.json` and `.env.local`
3. Create `components/BathroomMap.tsx`
4. Add location markers

---

## 📊 Progress: 20% Complete

- ✅ Project Setup
- ✅ Services Configuration
- ✅ Location Services
- ⏳ Map View (next)
- ⏳ List View
- ⏳ Filters & Search

---

## 📝 Useful Commands

```bash
# Type check
npm run type-check

# Run tests
npm test

# Clear cache and restart
npx expo start --clear

# iOS simulator
npx expo start --ios

# Android emulator
npx expo start --android

# Check setup
./verify-setup.sh
```

---

## 🔗 Documentation

- `TESTING.md` - Testing guide for Phase 2.1
- `PROGRESS.md` - Latest development progress
- `STATUS.md` - Current status overview
- `PROJECT_LOG.md` - Full development log

---

**Ready to build!** 🎉

Location services are working. Start both terminals and test the app!
