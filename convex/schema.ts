import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  trailers: defineTable({
    youtubeId: v.string(),
    title: v.string(),
    thumbnail: v.string(),
    tags: v.array(v.string()),
    categoryId: v.string(),
    userId: v.string(),
  }),
  movies: defineTable({
    tmdbId: v.string(),
    title: v.string(),
    releaseDate: v.string(),
    overview: v.string(),
    posterPath: v.string(),
  }),
  // user trailers
  // user searches
  // yt <-> tmdb mapping
});
