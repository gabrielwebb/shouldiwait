import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  locations: defineTable({
    name: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    address: v.string(),
    placeType: v.string(), // e.g., "restaurant", "cafe", "gas_station"
    amenities: v.array(v.string()), // e.g., ["wheelchair_accessible", "changing_table"]
    timezone: v.string(), // IANA timezone e.g., "America/Los_Angeles"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_location", ["latitude", "longitude"])
    .index("by_created", ["createdAt"]),

  ratings: defineTable({
    locationId: v.id("locations"),
    userId: v.string(), // Clerk user ID (identity.subject)
    cleanliness: v.number(), // 1-5 scale
    review: v.optional(v.string()),
    timestamp: v.number(),
    createdAt: v.number(),
  })
    .index("by_location", ["locationId"])
    .index("by_user", ["userId"])
    .index("by_location_and_time", ["locationId", "timestamp"]),

  photos: defineTable({
    locationId: v.id("locations"),
    userId: v.string(),
    storageId: v.string(), // Convex Storage ID
    ratingId: v.optional(v.id("ratings")),
    createdAt: v.number(),
  })
    .index("by_location", ["locationId"])
    .index("by_rating", ["ratingId"]),

  cleanlinessInsights: defineTable({
    locationId: v.id("locations"),

    // Overall metrics
    avgCleanliness: v.number(),
    totalRatings: v.number(),

    // Peak time analysis (hours 0-23)
    peakCleanHour: v.optional(v.number()),
    peakDirtyHour: v.optional(v.number()),

    // Hourly breakdown (24 hours)
    hourlyAvg: v.array(v.object({
      hour: v.number(), // 0-23
      avgRating: v.number(),
      count: v.number(),
    })),

    // Day-of-week breakdown (0-6, Sun-Sat)
    dailyAvg: v.array(v.object({
      dayOfWeek: v.number(), // 0-6
      avgRating: v.number(),
      count: v.number(),
    })),

    // Historical trend (last 30 days)
    trend: v.optional(v.union(
      v.literal("improving"),
      v.literal("declining"),
      v.literal("stable")
    )),
    trendPercentage: v.optional(v.number()), // e.g., +15% improving

    // Time-based recommendations
    bestTimeToVisit: v.optional(v.string()), // "2-4pm (Mon-Fri)"
    worstTimeToAvoid: v.optional(v.string()), // "8-10am (weekdays)"

    // Recent history for sparkline charts (last 7 days)
    recentHistory: v.array(v.object({
      date: v.number(), // timestamp
      avgRating: v.number(),
      count: v.number(),
    })),

    lastUpdated: v.number(),
  })
    .index("by_location", ["locationId"])
    .index("by_last_updated", ["lastUpdated"]),
});
