import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get ratings for a specific location
export const getByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .order("desc")
      .collect();

    return ratings;
  },
});

// Get user's ratings
export const getMyRatings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return ratings;
  },
});

// Submit a cleanliness rating
export const submit = mutation({
  args: {
    locationId: v.id("locations"),
    cleanliness: v.number(), // 1-5
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Validate cleanliness score
    if (args.cleanliness < 1 || args.cleanliness > 5) {
      throw new Error("Cleanliness rating must be between 1 and 5");
    }

    const now = Date.now();

    const ratingId = await ctx.db.insert("ratings", {
      locationId: args.locationId,
      userId: identity.subject,
      cleanliness: args.cleanliness,
      review: args.review,
      timestamp: now,
      createdAt: now,
    });

    return ratingId;
  },
});
