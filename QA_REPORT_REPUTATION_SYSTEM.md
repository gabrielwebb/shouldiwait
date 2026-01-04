# QA Report: Reputation System - CRITICAL ISSUES FOUND

**Date**: January 4, 2026
**Lines of Code Reviewed**: ~1,100 lines
**Review Method**: Automated agent analysis + manual inspection
**Status**: ⚠️ **NOT PRODUCTION READY** - Critical bugs found

---

## Executive Summary

The reputation system implementation has **20 identified issues**, including:
- **3 CRITICAL bugs** that will cause data corruption or security vulnerabilities
- **7 HIGH PRIORITY issues** affecting performance and UX
- **6 MEDIUM PRIORITY issues** needing fixes before production
- **4 LOW PRIORITY cleanup** items

**TypeScript Status**: ✅ PASS (0 errors)
**Convex Deployment**: ✅ PASS
**Functional Testing**: ❌ FAIL (critical bugs found)
**Production Readiness**: ❌ NOT READY

---

## CRITICAL BUGS (FIX IMMEDIATELY)

### 1. Race Condition in Vote Counting (Data Corruption Risk)
**File**: `convex/reputation.ts:29-56`
**Severity**: 🔴 CRITICAL

**Bug**: When users change votes, concurrent updates can corrupt vote counts.

**Scenario**:
```
Time 0: Rating has 10 helpful, 5 not helpful
Time 1: User A changes vote → reads (10, 5)
Time 2: User B adds vote → updates to (11, 5)
Time 3: User A's update writes (9, 6) ← LOST USER B'S VOTE
```

**Fix Required**: Use atomic increment/decrement.

---

### 2. Users Can Vote on Own Reviews (Security Vulnerability)
**File**: `convex/reputation.ts:voteOnReview` (missing validation)
**Severity**: 🔴 CRITICAL

**Bug**: NO check preventing users from upvoting their own reviews.

**Impact**: Users can artificially boost their trust scores by voting on own reviews.

**Fix Required**:
```typescript
const rating = await ctx.db.get(args.ratingId);
if (rating.userId === identity.subject) {
  throw new Error("Cannot vote on your own review");
}
```

---

### 3. N+1 Query Performance (App Slowdown)
**File**: `convex/reputation.ts:getRatingsWithTrust`
**Severity**: 🔴 CRITICAL

**Bug**: For each rating, queries ALL user ratings separately.

**Impact**: Location with 50 ratings = 50 separate database queries. App will slow to unusable on popular locations.

**Fix Required**: Batch-query users, cache results.

---

## HIGH PRIORITY BUGS

### 4. Frontend Race Condition - Vote Spam
**File**: `components/HelpfulVoting.tsx:26-36`
**Severity**: 🟠 HIGH

**Bug**: User can rapidly tap vote button before `isVoting` state updates.

**Fix**: Add debouncing or optimistic locking.

---

### 5. Infinite Loading on Errors
**File**: `app/bathroom/[id].tsx:101-114`
**Severity**: 🟠 HIGH

**Bug**: If Convex query fails, shows "Loading..." forever. No error state.

**Fix**: Handle error state separately from loading state.

---

### 6. Badge Calculation Inconsistency
**File**: `convex/reputation.ts` (two locations)
**Severity**: 🟠 HIGH

**Bug**: Badge logic duplicated in two functions with DIFFERENT conditions. User sees different badges on profile vs reviews.

**Fix**: Extract badge logic to single helper function.

---

## MEDIUM PRIORITY ISSUES

### 7. No Error Feedback on Vote Failure
**File**: `components/HelpfulVoting.tsx:32`
**Bug**: Silent failure - only logs to console.

**Fix**: Show toast/alert when voting fails.

---

### 8. Unsafe Optional Chaining
**File**: `app/profile.tsx:88`
**Bug**: `user?.emailAddresses[0]` crashes if array is empty.

**Fix**: Use `user?.emailAddresses?.[0]?.emailAddress`.

---

### 9. Redundant Timestamp Fields
**File**: `convex/schema.ts`
**Bug**: `ratings` table has both `timestamp` and `createdAt` with same value.

**Fix**: Remove duplicate field.

---

## TypeScript Status: ✅ PASS

**Compilation**: 0 errors
**Generated Types**: API exports verified
**Convex Integration**: Working correctly

---

## Acceptance Criteria vs Actual Behavior

### User Story 1: Vote on Review Helpfulness

**Given**: A user viewing bathroom reviews
**When**: They tap "👍 Helpful" button
**Then**: Vote is recorded and count updates

| Criteria | Status | Notes |
|----------|--------|-------|
| Vote submission works | ⚠️ PARTIAL | Works but has race condition |
| Prevents duplicate votes | ✅ PASS | Composite index prevents duplicates |
| Updates vote counts | ⚠️ FAIL | Race condition can corrupt counts |
| Shows loading state | ❌ FAIL | No loading indicator |
| Shows error state | ❌ FAIL | Silent failure |
| Vote count updates in UI | ✅ PASS | Convex subscription works |
| Can change vote | ⚠️ PARTIAL | Works but no confirmation |

**Overall**: ❌ FAIL (4/7 criteria)

---

### User Story 2: View Trust Score

**Given**: A user with 100+ reviews and 80%+ helpful votes
**When**: They view their profile
**Then**: See trust score and "Trusted Reviewer" badge

| Criteria | Status | Notes |
|----------|--------|-------|
| Trust % calculates correctly | ✅ PASS | Math is correct |
| Badge displays | ⚠️ PARTIAL | Inconsistent across views |
| Shows vote breakdown | ✅ PASS | Helpful/not helpful counts shown |
| Handles users with < 10 votes | ⚠️ PARTIAL | Shows null but no clear messaging |
| Handles new users | ✅ PASS | Shows "Leave first review" message |
| Updates when votes change | ✅ PASS | Real-time via Convex |

**Overall**: ⚠️ PARTIAL (5/6 criteria)

---

### User Story 3: Reviews Sorted by Trust

**Given**: Viewing a bathroom with 20 reviews from different users
**When**: Page loads
**Then**: Most trusted reviewers appear first

| Criteria | Status | Notes |
|----------|--------|-------|
| Sorts by author trust first | ✅ PASS | Implemented |
| Then by helpful votes | ✅ PASS | Implemented |
| Then by date | ✅ PASS | Implemented |
| Handles ties correctly | ⚠️ PARTIAL | Reviews with 0 votes ranked by date only |
| Performance acceptable | ❌ FAIL | N+1 queries will slow app |
| Shows loading state | ❌ FAIL | Shows "Loading..." with no spinner |

**Overall**: ❌ FAIL (3/6 criteria)

---

### User Story 4: Cannot Game the System

**Security checks for preventing reputation manipulation**

| Criteria | Status | Notes |
|----------|--------|-------|
| Cannot vote multiple times | ✅ PASS | Database constraint prevents |
| Cannot vote on own reviews | ❌ FAIL | NOT IMPLEMENTED |
| Vote counts accurate | ❌ FAIL | Race condition allows corruption |
| Can't spam vote button | ❌ FAIL | No debouncing |
| Rate limiting | ❌ FAIL | Not implemented |

**Overall**: ❌ FAIL (1/5 criteria)

---

## What's Working vs What's Broken

### ✅ Working Correctly
1. TypeScript compilation (0 errors)
2. Convex deployment and type generation
3. Database schema structure
4. Basic query/mutation flow
5. Real-time updates via Convex subscriptions
6. Badge tier thresholds (when calculated correctly)
7. Dark mode support in UI
8. Trust score math (when no race condition)

### ❌ Broken / Not Working
1. Vote counting (race condition)
2. Self-voting prevention (missing)
3. Performance on popular locations (N+1 queries)
4. Frontend error handling (missing)
5. Loading states (inadequate)
6. Vote spam prevention (missing)
7. Badge consistency (different in two places)
8. User feedback on errors (missing)

### ⚠️ Partially Working
1. Vote submission (works but unsafe)
2. Trust score display (correct but inconsistent)
3. Review sorting (works but slow)
4. Vote changes (works but no confirmation)

---

## UAT Test Plan for User

### Pre-Test Setup
1. Start Convex: `npx convex dev --typecheck disable`
2. Start Expo: `npm start` → press 'i' for iOS
3. Sign in with Google
4. Have 2+ test accounts ready

### Test 1: Vote on a Review
**Steps**:
1. Navigate to a bathroom detail screen
2. Tap 👍 on a review
3. Wait 2 seconds
4. Tap 👎 on same review
5. Refresh page

**Expected**:
- Vote button highlights immediately
- Count increases by 1
- Can change vote
- New vote count persists

**Known Issues**:
- No loading spinner
- Button might accept multiple rapid taps
- No confirmation when changing vote

---

### Test 2: Check Your Trust Score
**Steps**:
1. Leave 5+ reviews on different bathrooms
2. Have another user vote on your reviews
3. Go to Profile screen
4. Check "YOUR REPUTATION" section

**Expected**:
- If < 10 total votes: No trust %
- If 5-9 reviews: "🌱 New Reviewer" badge
- If 10+ votes: Trust % displays
- Vote breakdown shows correct counts

**Known Issues**:
- Badge might differ from what shows on reviews
- If no reviews yet, shows generic message

---

### Test 3: View Sorted Reviews
**Steps**:
1. Find bathroom with 10+ reviews
2. Check review order
3. Note which reviews appear first

**Expected**:
- Trusted reviewers (with badges) appear first
- Reviews with more helpful votes rank higher
- Newest reviews appear last if tied

**Known Issues**:
- Slow loading on popular locations
- "Loading..." stays forever if error

---

### Test 4: Try to Game the System
**Steps**:
1. Leave a review
2. Try to vote on your own review
3. Try rapidly tapping vote button 10 times
4. Check if vote count is correct

**Expected**:
- Should NOT be able to vote on own review
- Should only count 1 vote even if tapped 10x

**Known Issues**:
- ❌ YOU CAN vote on own reviews (BUG)
- ❌ Rapid taps might create race condition

---

### Test 5: Error Handling
**Steps**:
1. Turn off WiFi
2. Try to vote on a review
3. Turn WiFi back on
4. Refresh page

**Expected**:
- Error message appears when offline
- Can retry after reconnecting
- Vote eventually goes through

**Known Issues**:
- ❌ No error message shown
- Shows "Loading..." forever if Convex is down
- User has no way to retry

---

## Recommended Fix Order (Agile Sprint Plan)

### Sprint 1: Critical Security & Data Integrity (2-3 hours)
1. **Fix self-voting** (30 min, ~20 lines)
2. **Fix race condition** (1 hour, ~50 lines)
3. **Test both fixes** (30 min)
4. **Deploy & verify** (30 min)

### Sprint 2: Performance & UX (3-4 hours)
5. **Batch user queries** (1.5 hours, ~80 lines)
6. **Add error states** (1 hour, ~60 lines)
7. **Add loading spinners** (30 min, ~30 lines)
8. **Test & verify** (1 hour)

### Sprint 3: Polish & Consistency (2-3 hours)
9. **Unify badge logic** (1 hour, ~40 lines)
10. **Add vote debouncing** (45 min, ~30 lines)
11. **Add error toasts** (45 min, ~40 lines)
12. **Final testing** (30 min)

**Total Effort**: 7-10 hours to production-ready

---

## Conclusion

**Current Status**: The reputation system has the right architecture and most features work, but has **critical bugs** that make it unsafe for production.

**Main Issues**:
1. Data corruption risk (race condition)
2. Security vulnerability (self-voting)
3. Performance problems (N+1 queries)
4. Poor error handling

**Recommendation**: **DO NOT DEPLOY** until critical bugs are fixed. The system needs 7-10 hours of focused work in small, tested increments (max 150 lines per fix) before it's production-ready.

**Next Step**: Fix critical bugs in order, test each fix individually, then proceed to performance and UX improvements.
