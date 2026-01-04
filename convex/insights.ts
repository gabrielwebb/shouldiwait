import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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

    try {
      // Fetch location to get timezone
      const location = await ctx.db.get(locationId);
      if (!location) {
        console.error(`[Insights] Location not found: ${locationId}`);
        return { success: false, reason: "Location not found" };
      }

    const timezone = location.timezone || "America/New_York"; // Default fallback

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

    // 2. Hourly breakdown (bucket by hour 0-23 in LOCATION'S timezone)
    const hourlyBuckets = new Array(24).fill(null).map((_, hour) => ({
      hour,
      ratings: [] as number[],
    }));

    ratings.forEach((rating) => {
      // Convert UTC timestamp to location's local time
      const localHour = getLocalHour(rating.timestamp, timezone);
      hourlyBuckets[localHour].ratings.push(rating.cleanliness);
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

    // 4. Daily breakdown (day of week 0-6, Sun-Sat in LOCATION'S timezone)
    const dailyBuckets = new Array(7).fill(null).map((_, day) => ({
      dayOfWeek: day,
      ratings: [] as number[],
    }));

    ratings.forEach((rating) => {
      // Convert UTC timestamp to location's local day
      const localDay = getLocalDayOfWeek(rating.timestamp, timezone);
      dailyBuckets[localDay].ratings.push(rating.cleanliness);
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

      console.log(`[Insights] Successfully calculated insights for location ${locationId} (${totalRatings} ratings)`);
      return { success: true, locationId };
    } catch (error) {
      console.error(`[Insights] Error calculating insights for ${locationId}:`, error);
      return { success: false, reason: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

// Internal mutation: Update recently rated locations (hourly cron)
export const updateRecentlyRatedLocations = internalMutation({
  handler: async (ctx) => {
    const startTime = Date.now();
    console.log('[Insights Cron] Starting hourly update...');

    try {
      // Find locations with ratings in the last 2 hours
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      const recentRatings = await ctx.db
        .query("ratings")
        .filter((q) => q.gte(q.field("timestamp"), twoHoursAgo))
        .collect();

      // Get unique location IDs
      const locationIds = [...new Set(recentRatings.map((r) => r.locationId))];

      console.log(`[Insights Cron] Found ${locationIds.length} locations with recent ratings`);

      // Schedule recalculation for each location
      for (const locationId of locationIds) {
        await ctx.scheduler.runAfter(0, internal.insights.calculateInsightsForLocation, {
          locationId,
        });
      }

      const duration = Date.now() - startTime;
      console.log(`[Insights Cron] Hourly update completed in ${duration}ms. Scheduled ${locationIds.length} updates.`);

      return { updatedCount: locationIds.length, durationMs: duration };
    } catch (error) {
      console.error('[Insights Cron] Hourly update failed:', error);
      throw error;
    }
  },
});

// Internal mutation: Recalculate all insights (daily cron) - PAGINATED
export const recalculateAllInsights = internalMutation({
  handler: async (ctx) => {
    const startTime = Date.now();
    console.log('[Insights Cron] Starting daily full recalculation...');

    try {
      // Use paginated query to avoid loading all ratings into memory
      // Process locations in batches of 100
      const BATCH_SIZE = 100;
      const locationIds = new Set<Id<"locations">>();

      // Paginate through ratings to collect unique location IDs
      let cursor = null;
      let hasMore = true;
      let pagesProcessed = 0;

      while (hasMore) {
        const result = await ctx.db
          .query("ratings")
          .paginate({ cursor: cursor ?? null, numItems: 1000 });

        result.page.forEach((rating) => locationIds.add(rating.locationId));

        cursor = result.continueCursor;
        hasMore = result.isDone === false;
        pagesProcessed++;

        if (pagesProcessed % 10 === 0) {
          console.log(`[Insights Cron] Processed ${pagesProcessed} pages, ${locationIds.size} unique locations so far...`);
        }
      }

      console.log(`[Insights Cron] Found ${locationIds.size} total locations across ${pagesProcessed} pages`);

      // Schedule recalculation for each location in batches
      const locationArray = Array.from(locationIds);
      for (let i = 0; i < locationArray.length; i += BATCH_SIZE) {
        const batch = locationArray.slice(i, i + BATCH_SIZE);

        // Schedule each location in the batch with slight delays to prevent overload
        for (let j = 0; j < batch.length; j++) {
          const delay = j * 100; // 100ms delay between each
          await ctx.scheduler.runAfter(delay, internal.insights.calculateInsightsForLocation, {
            locationId: batch[j],
          });
        }
      }

      const duration = Date.now() - startTime;
      console.log(`[Insights Cron] Daily recalculation completed in ${duration}ms. Scheduled ${locationIds.size} updates.`);

      return { totalLocations: locationIds.size, durationMs: duration, pagesProcessed };
    } catch (error) {
      console.error('[Insights Cron] Daily recalculation failed:', error);
      throw error;
    }
  },
});

// Internal mutation: Cleanup stale insights (weekly cron)
export const cleanupStaleInsights = internalMutation({
  handler: async (ctx) => {
    const startTime = Date.now();
    console.log('[Insights Cron] Starting weekly cleanup...');

    try {
      const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

      // Find insights not updated in 90 days
      const staleInsights = await ctx.db
        .query("cleanlinessInsights")
        .filter((q) => q.lt(q.field("lastUpdated"), ninetyDaysAgo))
        .collect();

      console.log(`[Insights Cron] Found ${staleInsights.length} stale insights to delete`);

      // Delete stale insights
      for (const insight of staleInsights) {
        await ctx.db.delete(insight._id);
      }

      const duration = Date.now() - startTime;
      console.log(`[Insights Cron] Weekly cleanup completed in ${duration}ms. Deleted ${staleInsights.length} stale insights.`);

      return { deletedCount: staleInsights.length, durationMs: duration };
    } catch (error) {
      console.error('[Insights Cron] Weekly cleanup failed:', error);
      throw error;
    }
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

// Helper: Get local hour from UTC timestamp using timezone
function getLocalHour(utcTimestamp: number, timezone: string): number {
  // Use Intl.DateTimeFormat to convert UTC to local timezone
  const date = new Date(utcTimestamp);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const hourPart = parts.find(p => p.type === 'hour');
  return hourPart ? parseInt(hourPart.value, 10) : date.getUTCHours();
}

// Helper: Get local day of week from UTC timestamp using timezone
function getLocalDayOfWeek(utcTimestamp: number, timezone: string): number {
  const date = new Date(utcTimestamp);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  });

  const dayName = formatter.format(date);
  const dayMap: Record<string, number> = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
  };

  return dayMap[dayName] ?? date.getUTCDay();
}
