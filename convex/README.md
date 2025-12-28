# Convex Backend

This directory contains the Convex backend functions and schema for Should I Wait?

## Setup

1. Install Convex CLI:
   ```bash
   npm install -g convex
   ```

2. Initialize Convex (run from project root):
   ```bash
   npx convex dev
   ```

3. Configure Clerk integration in Convex Dashboard:
   - Go to Settings → Authentication
   - Add Clerk as auth provider
   - Set `CLERK_JWT_ISSUER_DOMAIN` in environment variables

## Structure

- `schema.ts` - Database schema definitions
- `locations.ts` - Location queries and mutations
- `ratings.ts` - Rating and review functions
- `photos.ts` - Photo upload functions
- `insights.ts` - Cleanliness insights aggregations
- `crons.ts` - Scheduled jobs for trend analysis
