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
    title: v.string(),
    thumbnail: v.string(),
    tags: v.array(v.string()),
    categoryId: v.string(),
  },
  handler: async (ctx, args) => {
    const { youtubeId, title, thumbnail, tags, categoryId } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }

    // Create a new trailer entry
    await ctx.db.insert("trailers", {
      userId: identity.subject,
      youtubeId,
      title,
      thumbnail,
      tags,
      categoryId,
    });

    return { success: true };
  },
});
