# Should I Wait - User Acceptance Testing (UAT) Flow

**Purpose**: Verify app functionality before production launch
**Tester**: Gabriel Webb (Product Owner)
**Date**: January 4, 2026
**Status**: ⏳ Awaiting Sprint 3 completion before testing

---

## Prerequisites

### ⚠️ IMPORTANT: Complete Sprint 3 First

**This test flow CANNOT be completed until Sprint 3 is done.** The app currently uses mock data and is not connected to the Convex backend.

**Required before testing**:
- [ ] Database seeded with bathroom locations (Sprint 3.1)
- [ ] Home screen connected to Convex (Sprint 3.2)
- [ ] Bathroom detail connected to Convex (Sprint 3.3)
- [ ] Profile connected to Convex (Sprint 3.4)

### Environment Setup

1. **Start Convex Backend**:
   ```bash
   cd ~/Desktop/shouldiwait
   npx convex dev --typecheck disable
   ```
   - Wait for "Convex functions ready!" message
   - Leave terminal running

2. **Start Expo Development Server**:
   ```bash
   # In new terminal window
   npm start
   ```
   - Press `i` for iOS Simulator
   - OR press `a` for Android Emulator
   - OR scan QR code with Expo Go app on physical device

3. **Verify Environment**:
   - [ ] Convex dashboard shows seeded bathroom data
   - [ ] iOS Simulator or Android Emulator is running
   - [ ] App loads without errors
   - [ ] Console shows no red errors

---

## Test Scenarios

### Scenario 1: New User Onboarding ✅

**Goal**: Verify first-time user experience

**Steps**:
1. Fresh install (or clear app data)
2. Launch app
3. See onboarding screen
4. Tap "Get Started with Google"
5. Complete Google OAuth flow
6. Grant location permission when prompted

**Expected Results**:
- [ ] Onboarding screen appears with app description
- [ ] "Get Started with Google" button is visible
- [ ] OAuth opens in browser/web view
- [ ] After sign-in, redirects back to app
- [ ] Location permission prompt appears (iOS native dialog)
- [ ] After granting permission, see map or list view

**Pass Criteria**: User completes onboarding without errors and lands on home screen

**If Fails**:
- Check Convex environment variables in `.env.local`
- Check Clerk publishable key is correct
- Check OAuth redirect URL configured in Clerk dashboard

---

### Scenario 2: View Nearby Bathrooms 🟡

**Goal**: Verify location-based bathroom search

**Steps**:
1. On home screen, observe current location
2. See blue dot on map (or "My Location" in list)
3. Verify bathrooms appear on map/list
4. Check distance calculations are reasonable
5. Toggle between Map and List views
6. Pull down to refresh

**Expected Results**:
- [ ] Map shows blue dot for current location
- [ ] Bathroom markers appear on map (red pins)
- [ ] List shows bathrooms sorted by distance (closest first)
- [ ] Distances are in miles and reasonable (0.1 mi, 2.3 mi, etc.)
- [ ] Toggle button switches between map and list smoothly
- [ ] Pull-to-refresh updates location and bathroom list
- [ ] Loading spinner appears during refresh

**Pass Criteria**: At least 5 bathrooms visible within 5 miles

**If Fails**:
- Check database has seeded bathrooms in current location area
- Check `api.locations.getNearby` query is being called (not mock data)
- Check distance calculation function works correctly

**⚠️ NOTE**: This test will FAIL until Sprint 3.2 is complete (currently uses mock data)

---

### Scenario 3: View Bathroom Details 🟡

**Goal**: Verify bathroom information display

**Steps**:
1. Tap a bathroom from map or list
2. Observe detail screen
3. Check bathroom name, address, amenities
4. Look for cleanliness insights card
5. Scroll down to reviews section
6. Tap "Navigate" button

**Expected Results**:
- [ ] Detail screen shows real bathroom name (not "Bathroom Location")
- [ ] Address is displayed and accurate
- [ ] Amenities list shows features (e.g., "Wheelchair Accessible", "Baby Changing Station")
- [ ] Cleanliness Insights card appears with:
  - [ ] Overall cleanliness score
  - [ ] Peak clean/dirty times
  - [ ] 7-day trend sparkline
  - [ ] "Best time to visit" recommendation
- [ ] Reviews section shows "Recent Reviews" header
- [ ] If no reviews: "No reviews yet. Be the first to rate this bathroom!"
- [ ] If reviews exist: Review cards with trust scores
- [ ] "Navigate" button opens Apple Maps (iOS) or Google Maps (Android)
- [ ] Maps app opens with bathroom location pre-filled

**Pass Criteria**: All sections display real data, no placeholder text

**If Fails**:
- Check `api.locations.getById` query returns data
- Check `api.insights.getByLocation` query returns data
- Check CleanlinessInsightsCard component is rendered
- Check Platform.select() chooses correct map URL

**⚠️ NOTE**: This test will FAIL until Sprint 3.3 is complete (currently shows placeholder data)

---

### Scenario 4: Submit a Rating & Review ✅

**Goal**: Verify review submission flow

**Steps**:
1. On bathroom detail screen, scroll to bottom
2. Tap "Write a Review" button (or similar)
3. Select cleanliness rating (1-5 stars)
4. Write review text (optional)
5. Tap "Submit"
6. Wait for confirmation
7. Observe review appears in list

**Expected Results**:
- [ ] Rating selector appears (1-5 stars or slider)
- [ ] Can select rating (1 = very dirty, 5 = very clean)
- [ ] Text input for review appears
- [ ] Submit button is enabled after selecting rating
- [ ] Loading spinner appears during submission
- [ ] Success message or confirmation appears
- [ ] Review appears immediately in "Recent Reviews" section
- [ ] Review shows your name/email from Clerk
- [ ] Vote counters initialize to "0 helpful, 0 not helpful"
- [ ] No trust score on your own review (requires 10 votes from others)

**Pass Criteria**: Review submission succeeds and appears instantly

**If Fails**:
- Check `api.ratings.submit` mutation works
- Check Clerk authentication is working (identity.subject exists)
- Check review initializes helpfulVotes and notHelpfulVotes to 0
- Check real-time Convex subscription updates review list

**⚠️ NOTE**: Review submission should work now, but test after Sprint 3.3 to verify full flow

---

### Scenario 5: Vote on Review Helpfulness ✅

**Goal**: Verify reputation system voting

**Steps**:
1. On bathroom detail screen, find someone else's review
2. Tap 👍 (Helpful) button
3. Observe counter increment
4. Wait 2 seconds
5. Tap 👎 (Not Helpful) button
6. Observe counters change
7. Try to vote on your own review

**Expected Results**:
- [ ] Helpful button (👍) highlights when tapped
- [ ] Counter increments immediately: "1 helpful"
- [ ] When changing to 👎, helpful decrements and not helpful increments: "0 helpful, 1 not helpful"
- [ ] Vote persists after closing and reopening detail screen
- [ ] Cannot vote on your own review (button disabled or error message)
- [ ] Loading state during vote submission (button disabled briefly)

**Pass Criteria**: Vote changes work correctly, cannot vote on own review

**If Fails**:
- Check `api.reputation.voteOnReview` mutation works
- Check self-voting prevention (Sprint 1 fix)
- Check race condition mitigation (Sprint 1 fix)
- Check vote counters update correctly

**✅ This feature is production-ready** (Sprint 1 & 2 complete)

---

### Scenario 6: View Trust Score & Badge 🟡

**Goal**: Verify reputation display

**Steps**:
1. Navigate to Profile screen (bottom tab)
2. Observe "YOUR REPUTATION" section
3. Check trust score percentage
4. Check badge display
5. Check helpful/not helpful vote breakdown

**Expected Results**:
- [ ] If < 10 total votes: "Not enough votes yet" or similar
- [ ] If 10+ votes: Trust percentage displays (e.g., "87% trusted")
- [ ] Badge appears based on criteria:
  - [ ] 5-49 reviews → 🌱 "New Reviewer"
  - [ ] 50-99 reviews, 70%+ trust → 🥉 "Regular Contributor"
  - [ ] 100-249 reviews, 80%+ trust → 🥈 "Trusted Reviewer"
  - [ ] 250+ reviews, 90%+ trust → 🥇 "Cleanliness Expert"
- [ ] Helpful votes count is accurate
- [ ] Not helpful votes count is accurate
- [ ] Total reviews count matches actual reviews written
- [ ] Progress hint appears (e.g., "5 more reviews to unlock New Reviewer badge")

**Pass Criteria**: Trust score and badge calculations are correct

**If Fails**:
- Check `api.reputation.getUserTrustScore` query works
- Check badge threshold logic (reputation.ts lines 139-145)
- Check vote aggregation across all user's reviews

**⚠️ NOTE**: Need multiple test accounts to give each other votes for realistic testing

**✅ Trust score logic is production-ready** (Sprint 1 & 2 complete, just needs data)

---

### Scenario 7: View Your Reviews 🟡

**Goal**: Verify profile review list

**Steps**:
1. On Profile screen, scroll down to "Your Reviews" section
2. Observe list of your submitted reviews
3. Check each review shows:
   - Bathroom name
   - Your rating (1-5)
   - Your review text
   - Date submitted
   - Helpful/not helpful votes

**Expected Results**:
- [ ] All reviews you submitted appear
- [ ] Reviews are sorted by date (newest first)
- [ ] Each review card shows complete information
- [ ] Tapping a review navigates to that bathroom's detail screen
- [ ] If no reviews: "You haven't written any reviews yet"

**Pass Criteria**: All user's reviews appear correctly

**If Fails**:
- Check `api.ratings.getMyRatings` query works
- Check reviews filtered by `identity.subject`

**⚠️ NOTE**: This test will FAIL until Sprint 3.4 is complete (profile not connected to Convex)

---

### Scenario 8: Error Handling ✅

**Goal**: Verify graceful error handling

**Steps**:
1. On bathroom detail screen, turn off WiFi
2. Observe loading state
3. Wait 10 seconds
4. Observe error state appears
5. Turn WiFi back on
6. Tap "Retry" button
7. Observe data loads successfully

**Expected Results**:
- [ ] Loading state shows ActivityIndicator (spinner) + "Loading reviews..." text
- [ ] After 10 seconds, error state appears:
  - [ ] Error message: "Unable to load reviews. Please check your connection and try again."
  - [ ] Blue "Retry" button visible
- [ ] Tapping Retry reloads page
- [ ] After WiFi reconnects, data loads successfully
- [ ] No infinite loading state
- [ ] No app crash

**Pass Criteria**: Error state appears after 10s timeout, retry works

**If Fails**:
- Check timeout detection (app/bathroom/[id].tsx lines 27-38)
- Check error UI (lines 120-138)
- Check retry button calls router.replace()

**✅ This feature is production-ready** (Sprint 2.2 complete)

---

### Scenario 9: Dark Mode ✅

**Goal**: Verify dark mode support

**Steps**:
1. Open iOS Settings → Display & Brightness → Dark
2. OR Android Settings → Display → Dark theme
3. Return to app
4. Observe all screens in dark mode
5. Check:
   - Background colors (dark gray, not pure black)
   - Text colors (white/light gray)
   - Button colors (blue remains visible)
   - Map markers (still visible)

**Expected Results**:
- [ ] All screens switch to dark mode automatically
- [ ] No pure white backgrounds (should be dark gray)
- [ ] Text is readable (high contrast)
- [ ] Buttons and interactive elements remain visible
- [ ] No harsh color combinations (eye strain)
- [ ] Map tiles switch to dark mode (if supported by provider)

**Pass Criteria**: Dark mode looks polished on all screens

**If Fails**:
- Check `useColorScheme()` hook usage
- Check `getBackgroundColor()` and `getTextColor()` helper functions
- Check all components respect `isDark` prop

**✅ This feature is production-ready** (dark mode fully implemented)

---

### Scenario 10: Sign Out 🟡

**Goal**: Verify sign-out flow

**Steps**:
1. Go to Profile screen
2. Scroll to Settings section
3. Tap "Sign Out" button
4. Confirm sign-out in dialog
5. Observe redirect to sign-in screen
6. Try to access protected screens

**Expected Results**:
- [ ] Sign out button is visible in settings
- [ ] Confirmation dialog appears: "Are you sure you want to sign out?"
- [ ] After confirming, user is signed out
- [ ] Redirect to sign-in screen
- [ ] Cannot access protected screens without re-authentication
- [ ] Re-signing in works correctly

**Pass Criteria**: Sign out works and clears session

**If Fails**:
- Check sign-out button exists
- Check `useAuth().signOut()` is called
- Check Clerk token cache is cleared

**⚠️ NOTE**: This test will FAIL until Sprint 4.1 is complete (no sign-out button yet)

---

## Platform-Specific Testing

### iOS-Specific Checks

**Required Device**: iPhone simulator or physical iPhone (iOS 15+)

1. **Native Components**:
   - [ ] ActivityIndicator uses iOS style spinner
   - [ ] Fonts match iOS system font (SF Pro)
   - [ ] Tap targets are 44×44 minimum
   - [ ] Navigation bar follows iOS conventions

2. **Platform Features**:
   - [ ] Location permission uses iOS native dialog
   - [ ] OAuth opens in SFSafariViewController
   - [ ] "Navigate" button opens Apple Maps app
   - [ ] Dark mode matches iOS system setting

3. **Performance**:
   - [ ] Smooth scrolling (60 FPS)
   - [ ] No jank during map interactions
   - [ ] Pull-to-refresh feels native

---

### Android-Specific Checks

**Required Device**: Android emulator or physical Android device (Android 10+)

1. **Native Components**:
   - [ ] ActivityIndicator uses Material Design spinner
   - [ ] Fonts match Roboto
   - [ ] Tap targets are 48dp minimum
   - [ ] Bottom navigation follows Material Design

2. **Platform Features**:
   - [ ] Location permission uses Android native dialog
   - [ ] OAuth opens in Chrome Custom Tab
   - [ ] "Navigate" button opens Google Maps app
   - [ ] Dark mode matches Android system setting

3. **Performance**:
   - [ ] Smooth scrolling on mid-range devices
   - [ ] Map performance acceptable on low-end devices
   - [ ] No memory leaks during extended use

---

## Cross-Platform Testing

### Web Testing (Optional)

**Browser**: Chrome, Safari, Firefox

1. Start Expo web:
   ```bash
   npm start
   # Press 'w' for web
   ```

2. **Expected Behavior**:
   - [ ] `BathroomMapWeb` fallback renders (no native map)
   - [ ] Location permission uses browser geolocation API
   - [ ] OAuth opens in new tab
   - [ ] All features work except native maps

**⚠️ NOTE**: Web is not the primary platform. Test for regressions only.

---

## Performance Benchmarks

### Load Times

**Acceptable**:
- Home screen first load: < 3 seconds
- Bathroom detail screen: < 2 seconds
- Review submission: < 1 second
- Vote submission: < 500ms

**Measure**:
1. Open Chrome DevTools Network tab (if testing on web)
2. OR use React Native Debugger
3. Record time from navigation to content display

---

### Memory Usage

**Acceptable**:
- iOS: < 150 MB total app memory
- Android: < 200 MB total app memory

**Measure**:
1. Xcode → Debug → Memory Report (iOS)
2. Android Studio → Profiler → Memory (Android)
3. Use app for 10 minutes (navigate, submit reviews, etc.)
4. Check for memory leaks (increasing trend)

---

## Bug Reporting Template

**If a test fails, document the bug using this template**:

```markdown
### Bug #X: [Short Description]

**Severity**: Critical / High / Medium / Low
**Test Scenario**: [Which scenario from this document?]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen]
**Actual**: [What actually happened]

**Environment**:
- Platform: iOS 17.2 / Android 14 / Web
- Device: iPhone 15 Simulator / Pixel 7 Emulator
- App Version: [Check package.json]
- Convex Deployment: Dev / Prod

**Screenshots**: [Attach if applicable]

**Console Errors**: [Copy/paste any red errors]

**Workaround**: [If known]
```

---

## Post-Testing Checklist

### After Completing All Tests

- [ ] Document all bugs found (use template above)
- [ ] Prioritize bugs (Critical → High → Medium → Low)
- [ ] File critical bugs as GitHub issues
- [ ] Re-test after bug fixes
- [ ] Sign off on production readiness

### Production Go/No-Go Criteria

**✅ GO** if ALL of these are true:
- [ ] All "Critical" priority tests pass
- [ ] No blocking bugs remain
- [ ] Performance benchmarks met
- [ ] Dark mode works on all screens
- [ ] Sign out works
- [ ] Error handling graceful

**❌ NO-GO** if ANY of these are true:
- [ ] Cannot sign in
- [ ] Cannot view bathrooms
- [ ] Cannot submit ratings
- [ ] App crashes frequently
- [ ] Data loss occurs
- [ ] Security vulnerabilities found

---

## Testing Timeline

### Sprint 3 Completion → UAT (Estimated: 2-3 hours)

**Day 1: Core Flows** (1.5 hours)
- Scenario 1: New user onboarding
- Scenario 2: View nearby bathrooms
- Scenario 3: View bathroom details
- Scenario 4: Submit rating & review

**Day 2: Advanced Features** (1 hour)
- Scenario 5: Vote on reviews
- Scenario 6: View trust score
- Scenario 7: View your reviews
- Scenario 8: Error handling

**Day 3: Platform Testing** (30 minutes)
- iOS-specific checks
- Android-specific checks
- Performance benchmarks

---

## Sign-Off

**Tester**: _______________________
**Date**: _______________________
**Outcome**: ✅ PASS / ❌ FAIL / ⚠️ PASS WITH ISSUES

**Notes**:
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

**Production Recommendation**: ✅ READY / ⚠️ READY WITH CAVEATS / ❌ NOT READY

---

**Document Created**: January 4, 2026
**By**: Claude Sonnet 4.5
**For**: Gabriel Webb (Product Owner)
**Project**: Should I Wait - Bathroom Finder App
