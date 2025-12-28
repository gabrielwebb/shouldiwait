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
    avgCleanliness: v.number(),
    totalRatings: v.number(),
    peakCleanHour: v.optional(v.number()), // 0-23
    peakDirtyHour: v.optional(v.number()),
    lastUpdated: v.number(),
  }).index("by_location", ["locationId"]),
});
