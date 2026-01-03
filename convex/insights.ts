import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Public query: Get insights for a specific location
export const getByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const insight = await ctx.db
      .query("cleanlinessInsights")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .first();

    return insight ?? null;
  },
});

// Public query: Get insights for multiple locations (batch)
export const getBatch = query({
  args: { locationIds: v.array(v.id("locations")) },
  handler: async (ctx, args) => {
    const insights = await Promise.all(
      args.locationIds.map((id) =>
        ctx.db
          .query("cleanlinessInsights")
          .withIndex("by_location", (q) => q.eq("locationId", id))
          .first()
      )
    );

    return insights.filter(Boolean);
  },
});

// Public mutation: Force refresh insights for a location
export const refreshLocation = mutation({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Schedule immediate recalculation
    await ctx.scheduler.runAfter(0, internal.insights.calculateInsightsForLocation, {
      locationId: args.locationId,
    });

    return { success: true };
  },
});

// Internal mutation: Calculate insights for a specific location
export const calculateInsightsForLocation = internalMutation({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const { locationId } = args;

    // Fetch all ratings for this location (last 90 days)
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_location_and_time", (q) =>
        q.eq("locationId", locationId).gte("timestamp", ninetyDaysAgo)
      )
      .collect();

    // If no ratings, skip or create empty insight
    if (ratings.length === 0) {
      return { success: false, reason: "No ratings" };
    }

    // 1. Calculate overall average
    const avgCleanliness = ratings.reduce((sum, r) => sum + r.cleanliness, 0) / ratings.length;
    const totalRatings = ratings.length;

    // 2. Hourly breakdown (bucket by hour 0-23)
    const hourlyBuckets = new Array(24).fill(null).map((_, hour) => ({
      hour,
      ratings: [] as number[],
    }));

    ratings.forEach((rating) => {
      const date = new Date(rating.timestamp);
      const hour = date.getUTCHours();
      hourlyBuckets[hour].ratings.push(rating.cleanliness);
    });

    const hourlyAvg = hourlyBuckets.map((bucket) => ({
      hour: bucket.hour,
      avgRating: bucket.ratings.length > 0
        ? bucket.ratings.reduce((sum, r) => sum + r, 0) / bucket.ratings.length
        : 0,
      count: bucket.ratings.length,
    }));

    // 3. Find peak clean/dirty hours (min 3 ratings)
    const validHours = hourlyAvg.filter((h) => h.count >= 3);
    const peakCleanHour = validHours.length > 0
      ? validHours.reduce((max, h) => (h.avgRating > max.avgRating ? h : max)).hour
      : undefined;
    const peakDirtyHour = validHours.length > 0
      ? validHours.reduce((min, h) => (h.avgRating < min.avgRating ? h : min)).hour
      : undefined;

    // 4. Daily breakdown (day of week 0-6, Sun-Sat)
    const dailyBuckets = new Array(7).fill(null).map((_, day) => ({
      dayOfWeek: day,
      ratings: [] as number[],
    }));

    ratings.forEach((rating) => {
      const date = new Date(rating.timestamp);
      const dayOfWeek = date.getUTCDay();
      dailyBuckets[dayOfWeek].ratings.push(rating.cleanliness);
    });

    const dailyAvg = dailyBuckets.map((bucket) => ({
      dayOfWeek: bucket.dayOfWeek,
      avgRating: bucket.ratings.length > 0
        ? bucket.ratings.reduce((sum, r) => sum + r, 0) / bucket.ratings.length
        : 0,
      count: bucket.ratings.length,
    }));

    // 5. Trend analysis (last 7 days vs previous 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    const recentRatings = ratings.filter((r) => r.timestamp >= sevenDaysAgo);
    const previousRatings = ratings.filter(
      (r) => r.timestamp >= fourteenDaysAgo && r.timestamp < sevenDaysAgo
    );

    let trend: "improving" | "declining" | "stable" | undefined = undefined;
    let trendPercentage: number | undefined = undefined;

    if (recentRatings.length >= 5 && previousRatings.length >= 5) {
      const recentAvg = recentRatings.reduce((sum, r) => sum + r.cleanliness, 0) / recentRatings.length;
      const previousAvg = previousRatings.reduce((sum, r) => sum + r.cleanliness, 0) / previousRatings.length;

      trendPercentage = ((recentAvg - previousAvg) / previousAvg) * 100;
      trend = trendPercentage > 5 ? "improving" : trendPercentage < -5 ? "declining" : "stable";
    }

    // 6. Generate time recommendations
    const bestTimeToVisit = generateRecommendation(hourlyAvg, dailyAvg, "best");
    const worstTimeToAvoid = generateRecommendation(hourlyAvg, dailyAvg, "worst");

    // 7. Recent history for sparklines (last 7 days, daily buckets)
    const recentHistory = generateRecentHistory(ratings, sevenDaysAgo);

    // 8. Upsert into cleanlinessInsights table
    const existing = await ctx.db
      .query("cleanlinessInsights")
      .withIndex("by_location", (q) => q.eq("locationId", locationId))
      .first();

    const insightData = {
      locationId,
      avgCleanliness,
      totalRatings,
      peakCleanHour,
      peakDirtyHour,
      hourlyAvg,
      dailyAvg,
      trend,
      trendPercentage,
      bestTimeToVisit,
      worstTimeToAvoid,
      recentHistory,
      lastUpdated: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, insightData);
    } else {
      await ctx.db.insert("cleanlinessInsights", insightData);
    }

    return { success: true, locationId };
  },
});

// Internal mutation: Update recently rated locations (hourly cron)
export const updateRecentlyRatedLocations = internalMutation({
  handler: async (ctx) => {
    // Find locations with ratings in the last 2 hours
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const recentRatings = await ctx.db
      .query("ratings")
      .filter((q) => q.gte(q.field("timestamp"), twoHoursAgo))
      .collect();

    // Get unique location IDs
    const locationIds = [...new Set(recentRatings.map((r) => r.locationId))];

    // Schedule recalculation for each location
    for (const locationId of locationIds) {
      await ctx.scheduler.runAfter(0, internal.insights.calculateInsightsForLocation, {
        locationId,
      });
    }

    return { updatedCount: locationIds.length };
  },
});

// Internal mutation: Recalculate all insights (daily cron)
export const recalculateAllInsights = internalMutation({
  handler: async (ctx) => {
    // Get all locations with at least one rating
    const allRatings = await ctx.db.query("ratings").collect();
    const locationIds = [...new Set(allRatings.map((r) => r.locationId))];

    // Schedule recalculation for each location
    for (const locationId of locationIds) {
      await ctx.scheduler.runAfter(0, internal.insights.calculateInsightsForLocation, {
        locationId,
      });
    }

    return { totalLocations: locationIds.length };
  },
});

// Internal mutation: Cleanup stale insights (weekly cron)
export const cleanupStaleInsights = internalMutation({
  handler: async (ctx) => {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    // Find insights not updated in 90 days
    const staleInsights = await ctx.db
      .query("cleanlinessInsights")
      .filter((q) => q.lt(q.field("lastUpdated"), ninetyDaysAgo))
      .collect();

    // Delete stale insights
    for (const insight of staleInsights) {
      await ctx.db.delete(insight._id);
    }

    return { deletedCount: staleInsights.length };
  },
});

// Helper: Generate time recommendations
function generateRecommendation(
  hourlyAvg: Array<{ hour: number; avgRating: number; count: number }>,
  dailyAvg: Array<{ dayOfWeek: number; avgRating: number; count: number }>,
  type: "best" | "worst"
): string | undefined {
  // Filter hours with at least 3 ratings
  const validHours = hourlyAvg.filter((h) => h.count >= 3);
  if (validHours.length === 0) return undefined;

  // Find best or worst hour
  const targetHour =
    type === "best"
      ? validHours.reduce((max, h) => (h.avgRating > max.avgRating ? h : max))
      : validHours.reduce((min, h) => (h.avgRating < min.avgRating ? h : min));

  // Format hour range (e.g., "2-4pm")
  const startHour = targetHour.hour;
  const endHour = (targetHour.hour + 2) % 24;
  const timeRange = formatTimeRange(startHour, endHour);

  // Check if weekday vs weekend pattern exists
  const weekdayDays = [1, 2, 3, 4, 5]; // Mon-Fri
  const weekendDays = [0, 6]; // Sun, Sat

  const weekdayAvg =
    dailyAvg
      .filter((d) => weekdayDays.includes(d.dayOfWeek) && d.count >= 5)
      .reduce((sum, d) => sum + d.avgRating, 0) /
    dailyAvg.filter((d) => weekdayDays.includes(d.dayOfWeek) && d.count >= 5).length;

  const weekendAvg =
    dailyAvg
      .filter((d) => weekendDays.includes(d.dayOfWeek) && d.count >= 5)
      .reduce((sum, d) => sum + d.avgRating, 0) /
    dailyAvg.filter((d) => weekendDays.includes(d.dayOfWeek) && d.count >= 5).length;

  const dayPattern =
    !isNaN(weekdayAvg) && !isNaN(weekendAvg) && Math.abs(weekdayAvg - weekendAvg) > 0.3
      ? weekdayAvg > weekendAvg
        ? "Mon-Fri"
        : "weekends"
      : "";

  return dayPattern ? `${timeRange} (${dayPattern})` : timeRange;
}

// Helper: Format time range
function formatTimeRange(startHour: number, endHour: number): string {
  const formatHour = (hour: number) => {
    if (hour === 0) return "12am";
    if (hour < 12) return `${hour}am`;
    if (hour === 12) return "12pm";
    return `${hour - 12}pm`;
  };

  return `${formatHour(startHour)}-${formatHour(endHour)}`;
}

// Helper: Generate recent history for sparklines
function generateRecentHistory(
  ratings: Array<{ cleanliness: number; timestamp: number }>,
  sevenDaysAgo: number
): Array<{ date: number; avgRating: number; count: number }> {
  const recentRatings = ratings.filter((r) => r.timestamp >= sevenDaysAgo);

  // Group by day
  const dayBuckets = new Map<number, number[]>();
  recentRatings.forEach((rating) => {
    const date = new Date(rating.timestamp);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    if (!dayBuckets.has(dayStart)) {
      dayBuckets.set(dayStart, []);
    }
    dayBuckets.get(dayStart)!.push(rating.cleanliness);
  });

  // Convert to array and sort by date
  const history = Array.from(dayBuckets.entries())
    .map(([date, ratings]) => ({
      date,
      avgRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      count: ratings.length,
    }))
    .sort((a, b) => a.date - b.date);

  // Fill missing days with 0 count (for sparkline continuity)
  const filledHistory: Array<{ date: number; avgRating: number; count: number }> = [];
  for (let i = 0; i < 7; i++) {
    const targetDate = sevenDaysAgo + i * 24 * 60 * 60 * 1000;
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayStartTime = dayStart.getTime();

    const existing = history.find((h) => h.date === dayStartTime);
    filledHistory.push(
      existing || { date: dayStartTime, avgRating: 0, count: 0 }
    );
  }

  return filledHistory;
}
