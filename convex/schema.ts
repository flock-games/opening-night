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
  })
    .index("by_youtube_id", ["youtubeId"])
    .index("by_movie_id", ["movieId"]),
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
    dismissed: v.optional(v.boolean()),
  })
    .index("by_user_id", ["userId"])
    .index("by_trailer_id", ["trailerId"]),
  youtubeSyncs: defineTable({
    userId: v.string(),
    status: v.string(),
  }).index("by_user_id", ["userId"]),
});
