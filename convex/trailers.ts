import { Id } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const fetch = query({
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

    const trailers = await Promise.all(
      userTrailers.map(async (userTrailer) => {
        const trailer = await ctx.db.get(userTrailer.trailerId);
        return trailer;
      }),
    ).then((trailers) => trailers.filter((trailer) => trailer !== null));

    const trailersWithMovies = await Promise.all(
      trailers.map(async (trailer) => {
        if (!trailer?.movieId) return trailer;
        const movie = await ctx.db.get(trailer.movieId);
        return { ...trailer, movieData: movie };
      }),
    );

    return trailersWithMovies;
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
