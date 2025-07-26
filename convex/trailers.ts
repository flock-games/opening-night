import { Id } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const fetch = query({
  args: {},
  handler: async (convexToJson, args) => {
    const trailers = await convexToJson.db.query("trailers").collect();
    return trailers;
  },
});

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
    });
  },
});
