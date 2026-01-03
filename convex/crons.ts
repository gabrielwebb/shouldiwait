import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Hourly: Update insights for recently rated locations
crons.interval(
  "update-recent-insights",
  { minutes: 60 }, // Every hour
  internal.insights.updateRecentlyRatedLocations
);

// Daily: Full recalculation for all locations with ratings
crons.interval(
  "full-insight-recalculation",
  { hours: 24 }, // Once per day
  internal.insights.recalculateAllInsights
);

// Weekly: Cleanup stale insights for inactive locations
crons.weekly(
  "cleanup-stale-insights",
  { dayOfWeek: "sunday", hourUTC: 3, minuteUTC: 0 }, // 3am UTC every Sunday
  internal.insights.cleanupStaleInsights
);

export default crons;
