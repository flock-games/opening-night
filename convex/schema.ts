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
  streamingPlatforms: defineTable({
    provider_id: v.number(),
    provider_name: v.string(),
    logo_path: v.string(),
    display_priority: v.number(),
  }).index("by_provider_id", ["provider_id"]),
  movies: defineTable({
    tmdbId: v.string(),
    title: v.string(),
    releaseDate: v.string(),
    overview: v.string(),
    posterPath: v.string(),
    streamingPlatforms: v.optional(
      v.union(
        v.array(v.id("streamingPlatforms")), // New format: array of IDs
        v.array(
          v.object({
            // Old format: array of objects (for migration compatibility)
            provider_id: v.number(),
            provider_name: v.string(),
            logo_path: v.string(),
            display_priority: v.number(),
          }),
        ),
      ),
    ),
    streamingPlatformsLastUpdated: v.optional(v.string()),
  }),
  userTrailers: defineTable({
    userId: v.string(),
    trailerId: v.id("trailers"),
    dismissed: v.optional(v.boolean()),
  })
    .index("by_user_id", ["userId"])
    .index("by_trailer_id", ["trailerId"]),
  userNotifications: defineTable({
    userId: v.string(),
    enabled: v.boolean(),
    email: v.string(),
  }).index("by_user_id", ["userId"]),
  youtubeSyncs: defineTable({
    userId: v.string(),
    status: v.string(),
  }).index("by_user_id", ["userId"]),
});
