import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  trailers: defineTable({
    youtubeId: v.string(),
    movieId: v.optional(v.id("movies")),
    title: v.string(),
    parsedTitle: v.string(),
    thumbnail: v.string(),
    tags: v.array(v.string()),
    categoryId: v.string(),
  }).index("by_youtube_id", ["youtubeId"]),
  movies: defineTable({
    tmdbId: v.string(),
    title: v.string(),
    releaseDate: v.string(),
    overview: v.string(),
    posterPath: v.string(),
  }),
  userTrailers: defineTable({
    userId: v.string(),
    trailerId: v.id("trailers"),
  }).index("by_user_id", ["userId"]),
  // user searches
});
