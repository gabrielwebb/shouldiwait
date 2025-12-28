1. What This App Does
Should I Wait? helps you quickly find clean bathrooms nearby so you know whether to go now or wait. It uses your location and up-to-date community ratings to show cleanliness and the best options around you.

2. Core Features
- Nearby Bathrooms: See restrooms on a map or list, filter by distance and amenities, and hand off to native navigation for turn-by-turn directions. Custom implementation using Expo Location for GPS, react-native-maps for rendering, Convex for place data, and deep links to Apple Maps/Google Maps for navigation.
- Cleanliness Insights: View each location’s historical cleanliness trends, peak clean/dirty times, and summaries to pick the best time to visit. Custom implementation powered by Convex aggregations, scheduled functions, and real-time queries to generate and display time-based insights.
- Ratings & Reviews: Read and submit cleanliness ratings, short reviews, and photo-backed votes with an aggregated score and recent activity per location. Custom implementation with Clerk-authenticated submissions, Convex for data and moderation workflows, and Convex Storage for photo uploads/CDN.

3. Tech Stack
- Framework: Expo (React Native for iOS & Android)
- Database & Serverless Functions: Convex (real-time queries, scheduled jobs, Storage API)
- Auth: Clerk (Expo)
- Geolocation: Expo Location
- Maps: react-native-maps (Apple/Google map tiles)
- Directions: Native deep links to Apple Maps / Google Maps
- Media Storage: Convex Storage (photos, signed URLs/CDN)

4. UI Design Style
A clean, map-first, minimal interface with color-coded cleanliness badges and simple filters that make decisions fast, large tap targets for one-handed use, and photo-forward review cards.