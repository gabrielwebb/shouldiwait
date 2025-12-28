import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get nearby locations based on user's current position
export const getNearby = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusMiles: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { latitude, longitude, radiusMiles = 5 } = args;

    // TODO: Implement geospatial filtering
    // For now, return all locations (will be filtered client-side)
    const locations = await ctx.db.query("locations").collect();

    return locations;
  },
});

// Get a single location by ID
export const getById = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Add a new bathroom location
export const add = mutation({
  args: {
    name: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    address: v.string(),
    placeType: v.string(),
    amenities: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();

    const locationId = await ctx.db.insert("locations", {
      name: args.name,
      latitude: args.latitude,
      longitude: args.longitude,
      address: args.address,
      placeType: args.placeType,
      amenities: args.amenities,
      createdAt: now,
      updatedAt: now,
    });

    return locationId;
  },
});
