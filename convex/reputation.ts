import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Vote on a review's helpfulness
 * Users can mark reviews as helpful or not helpful
 * Prevents duplicate votes from the same user
 */
export const voteOnReview = mutation({
  args: {
    ratingId: v.id("ratings"),
    isHelpful: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be signed in to vote on reviews");
    }

    // Prevent users from voting on their own reviews
    const rating = await ctx.db.get(args.ratingId);
    if (!rating) {
      throw new Error("Rating not found");
    }
    if (rating.userId === identity.subject) {
      throw new Error("Cannot vote on your own review");
    }

    // Check if user already voted on this review
    const existingVote = await ctx.db
      .query("reviewVotes")
      .withIndex("by_voter_and_rating", (q) =>
        q.eq("voterId", identity.subject).eq("ratingId", args.ratingId)
      )
      .first();

    if (existingVote) {
      // Update existing vote if it changed
      if (existingVote.isHelpful !== args.isHelpful) {
        await ctx.db.patch(existingVote._id, {
          isHelpful: args.isHelpful,
          timestamp: Date.now(),
        });

        // Re-fetch rating immediately before update to minimize race window
        const freshRating = await ctx.db.get(args.ratingId);
        if (!freshRating) throw new Error("Rating was deleted");

        if (args.isHelpful) {
          // Changed from not helpful to helpful
          await ctx.db.patch(args.ratingId, {
            helpfulVotes: freshRating.helpfulVotes + 1,
            notHelpfulVotes: Math.max(0, freshRating.notHelpfulVotes - 1),
          });
        } else {
          // Changed from helpful to not helpful
          await ctx.db.patch(args.ratingId, {
            helpfulVotes: Math.max(0, freshRating.helpfulVotes - 1),
            notHelpfulVotes: freshRating.notHelpfulVotes + 1,
          });
        }
      }
      return existingVote._id;
    }

    // Create new vote
    const voteId = await ctx.db.insert("reviewVotes", {
      ratingId: args.ratingId,
      voterId: identity.subject,
      isHelpful: args.isHelpful,
      timestamp: Date.now(),
    });

    // Re-fetch rating immediately before update to minimize race window
    const freshRating = await ctx.db.get(args.ratingId);
    if (!freshRating) throw new Error("Rating was deleted");

    // Update rating counters
    if (args.isHelpful) {
      await ctx.db.patch(args.ratingId, {
        helpfulVotes: freshRating.helpfulVotes + 1,
      });
    } else {
      await ctx.db.patch(args.ratingId, {
        notHelpfulVotes: freshRating.notHelpfulVotes + 1,
      });
    }

    return voteId;
  },
});

/**
 * Get a user's trust score (percentage of helpful votes)
 * Returns null if user has no ratings yet
 */
export const getUserTrustScore = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all ratings by this user
    const userRatings = await ctx.db
      .query("ratings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (userRatings.length === 0) {
      return {
        trustPercentage: null,
        totalRatings: 0,
        helpfulVotes: 0,
        notHelpfulVotes: 0,
        badge: null,
      };
    }

    // Calculate total votes across all user's ratings
    const totalHelpful = userRatings.reduce((sum, r) => sum + r.helpfulVotes, 0);
    const totalNotHelpful = userRatings.reduce((sum, r) => sum + r.notHelpfulVotes, 0);
    const totalVotes = totalHelpful + totalNotHelpful;

    // Need at least 10 votes to show trust percentage
    if (totalVotes < 10) {
      return {
        trustPercentage: null,
        totalRatings: userRatings.length,
        helpfulVotes: totalHelpful,
        notHelpfulVotes: totalNotHelpful,
        badge: userRatings.length >= 5 ? "new_reviewer" : null,
      };
    }

    const trustPercentage = (totalHelpful / totalVotes) * 100;

    // Determine badge based on ratings count and trust score
    let badge: string | null = null;
    if (userRatings.length >= 250 && trustPercentage >= 90) {
      badge = "cleanliness_expert"; // 🥇
    } else if (userRatings.length >= 100 && trustPercentage >= 80) {
      badge = "trusted_reviewer"; // 🥈
    } else if (userRatings.length >= 50 && trustPercentage >= 70) {
      badge = "regular_contributor"; // 🥉
    }

    return {
      trustPercentage: Math.round(trustPercentage),
      totalRatings: userRatings.length,
      helpfulVotes: totalHelpful,
      notHelpfulVotes: totalNotHelpful,
      badge,
    };
  },
});

/**
 * Get user's vote status for a specific rating
 */
export const getUserVoteForRating = query({
  args: {
    ratingId: v.id("ratings"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const vote = await ctx.db
      .query("reviewVotes")
      .withIndex("by_voter_and_rating", (q) =>
        q.eq("voterId", identity.subject).eq("ratingId", args.ratingId)
      )
      .first();

    return vote ? vote.isHelpful : null;
  },
});

/**
 * Get ratings with trust scores for a location
 */
export const getRatingsWithTrust = query({
  args: {
    locationId: v.id("locations"),
  },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_location", (q) => q.eq("locationId", args.locationId))
      .collect();

    // Get unique user IDs to batch-fetch their ratings
    const uniqueUserIds = [...new Set(ratings.map(r => r.userId))];

    // Batch-fetch all ratings for all unique users (1 query per user instead of 1 per rating)
    const userRatingsMap = new Map<string, typeof ratings>();
    await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const userRatings = await ctx.db
          .query("ratings")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect();
        userRatingsMap.set(userId, userRatings);
      })
    );

    // Calculate trust scores using cached user ratings
    const ratingsWithTrust = ratings.map((rating) => {
      const userRatings = userRatingsMap.get(rating.userId) || [];

      const totalHelpful = userRatings.reduce((sum, r) => sum + r.helpfulVotes, 0);
      const totalNotHelpful = userRatings.reduce((sum, r) => sum + r.notHelpfulVotes, 0);
      const totalVotes = totalHelpful + totalNotHelpful;

      let authorTrustPercentage: number | null = null;
      let authorBadge: string | null = null;

      if (totalVotes >= 10) {
        authorTrustPercentage = Math.round((totalHelpful / totalVotes) * 100);

        if (userRatings.length >= 250 && authorTrustPercentage >= 90) {
          authorBadge = "cleanliness_expert";
        } else if (userRatings.length >= 100 && authorTrustPercentage >= 80) {
          authorBadge = "trusted_reviewer";
        } else if (userRatings.length >= 50 && authorTrustPercentage >= 70) {
          authorBadge = "regular_contributor";
        }
      } else if (userRatings.length >= 5) {
        authorBadge = "new_reviewer";
      }

      return {
        ...rating,
        authorTrustPercentage,
        authorBadge,
        authorTotalRatings: userRatings.length,
      };
    });

    // Sort by trust score (highest first), then by helpful votes, then by date
    return ratingsWithTrust.sort((a, b) => {
      // Trusted reviewers first
      if (a.authorTrustPercentage && !b.authorTrustPercentage) return -1;
      if (!a.authorTrustPercentage && b.authorTrustPercentage) return 1;

      // Then by trust percentage
      if (a.authorTrustPercentage && b.authorTrustPercentage) {
        if (a.authorTrustPercentage !== b.authorTrustPercentage) {
          return b.authorTrustPercentage - a.authorTrustPercentage;
        }
      }

      // Then by helpful votes on this specific review
      const aHelpfulRatio = a.helpfulVotes / (a.helpfulVotes + a.notHelpfulVotes || 1);
      const bHelpfulRatio = b.helpfulVotes / (b.helpfulVotes + b.notHelpfulVotes || 1);
      if (aHelpfulRatio !== bHelpfulRatio) {
        return bHelpfulRatio - aHelpfulRatio;
      }

      // Finally by date (newest first)
      return b.createdAt - a.createdAt;
    });
  },
});
