import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
  args: {
    youtubeId: v.string(),
    movieId: v.optional(v.id("movies")),
    title: v.string(),
    parsedTitle: v.string(),
    thumbnail: v.string(),
    tags: v.array(v.string()),
    categoryId: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"trailers">> => {
    const {
      youtubeId,
      movieId,
      title,
      parsedTitle,
      thumbnail,
      tags,
      categoryId,
    } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }

    // Create a new trailer entry
    return await ctx.db.insert("trailers", {
      youtubeId,
      movieId,
      title,
      parsedTitle,
      thumbnail,
      tags,
      categoryId,
    });
  },
});

export const createUserTrailer = internalMutation({
  args: {
    trailerId: v.id("trailers"),
  },
  handler: async (ctx, args): Promise<Id<"userTrailers">> => {
    const { trailerId } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }

    // Create a new user trailer entry
    return await ctx.db.insert("userTrailers", {
      userId: identity.subject,
      trailerId,
      dismissed: false,
    });
  },
});

export const dismissUserTrailer = mutation({
  args: {
    userTrailerId: v.id("userTrailers"),
  },
  handler: async (ctx, args) => {
    const { userTrailerId } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }
    const userTrailer = await ctx.db.get(userTrailerId);
    if (!userTrailer || userTrailer.userId !== identity.subject) {
      throw new Error("User trailer not found or user not authorized");
    }

    // Dismiss the user trailer entry
    await ctx.db.patch(userTrailer._id, {
      dismissed: true,
    });
  },
});

export const getByYoutubeId = internalQuery({
  args: {
    youtubeId: v.string(),
  },
  handler: async (ctx, args) => {
    const { youtubeId } = args;
    const trailer = await ctx.db
      .query("trailers")
      .withIndex("by_youtube_id", (q) => q.eq("youtubeId", youtubeId))
      .first();

    return trailer;
  },
});

export const getUserTrailers = internalQuery({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }

    const userTrailers = await ctx.db
      .query("userTrailers")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect();

    return userTrailers;
  },
});
