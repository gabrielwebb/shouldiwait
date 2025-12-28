import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate an upload URL for photo uploads
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Save photo metadata after upload
export const addPhoto = mutation({
  args: {
    locationId: v.id("locations"),
    storageId: v.string(),
    ratingId: v.optional(v.id("ratings")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const photoId = await ctx.db.insert("photos", {
      locationId: args.locationId,
      userId: identity.subject,
      storageId: args.storageId,
      ratingId: args.ratingId,
      createdAt: Date.now(),
    });

    return photoId;
  },
});

// Get photos for a location
export const getByLocation = query({
  args: { locationId: v.id("locations") },
  handler: async (ctx, args) => {
    const photos = await ctx.db
      .query("photos")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .collect();

    // Get URLs for photos
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        const url = await ctx.storage.getUrl(photo.storageId);
        return { ...photo, url };
      })
    );

    return photosWithUrls;
  },
});
