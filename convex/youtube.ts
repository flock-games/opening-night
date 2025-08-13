import { action, query, internalMutation } from "./_generated/server";
import { createClerkClient } from "@clerk/backend";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";

const yearRegex = /(\d{4})/;
const dividerRegex = /[|:(-]/;

export const createSync = internalMutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }
    const id = await ctx.db.insert("youtubeSyncs", {
      userId: identity.subject,
      status: "requested",
    });
    return id;
  },
});

export const getMostRecentSyncTs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }
    const syncs = await ctx.db
      .query("youtubeSyncs")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect();
    if (syncs.length === 0) {
      return null;
    }
    return syncs[syncs.length - 1]._creationTime;
  },
});

export const updateSync = internalMutation({
  args: {
    id: v.id("youtubeSyncs"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, status } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }
    const sync = await ctx.db.get(id);
    if (!sync || sync.userId !== identity.subject) {
      throw new Error("Sync not found or user not authorized");
    }
    return await ctx.db.patch(id, { status });
  },
});

export const syncLikes = action({
  args: {
    syncType: v.optional(v.union(v.literal("likes"), v.literal("history"))),
  },
  handler: async (ctx, args) => {
    const { syncType = "likes" } = args;
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User is not authenticated");
    }
    const existingUserTrailers = await ctx.runQuery(
      internal.trailers.getUserTrailers,
      {},
    );
    const syncId = await ctx.runMutation(internal.youtube.createSync, {});

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_CLIENT_SECRET,
    });

    const clerkResponse = await clerkClient.users.getUserOauthAccessToken(
      identity.subject,
      "google",
    );
    const accessToken = clerkResponse.data[0].token;

    let doneSyncing = false;
    let pageToken = undefined;
    let page = 1;
    do {
      await ctx.runMutation(internal.youtube.updateSync, {
        id: syncId,
        status: `Syncing page ${page}`,
      });

      let url: string;
      if (syncType === "history") {
        // Use Activities API to get full YouTube history
        url = `https://youtube.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&mine=true&maxResults=50`;
      } else {
        // Use Videos API to get liked videos only
        url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&myRating=like&maxResults=50`;
      }

      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }
      url += `&key=${process.env.GOOGLE_API_KEY}`;
      
      const response = await fetch(url, {
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      });
      const data = await response.json();
      if (data.error) {
        throw new ConvexError(
          `${data.error.message} Log out and grant access to YouTube when you log in.`,
        );
      }

      if ("items" in data) {
        let videosToProcess: any[] = [];

        if (syncType === "history") {
          // Process activities from the Activities API
          videosToProcess = data.items
            .filter((item: any) => {
              // Filter for video-related activities
              return item.snippet.type === "like" || 
                     item.snippet.type === "favorite" ||
                     item.snippet.type === "comment" ||
                     (item.contentDetails && item.contentDetails.like);
            })
            .map((item: any) => {
              // Extract video information from activity
              let videoData = null;
              if (item.contentDetails?.like) {
                videoData = {
                  id: item.contentDetails.like.resourceId.videoId,
                  snippet: item.snippet,
                };
              } else if (item.contentDetails?.favorite) {
                videoData = {
                  id: item.contentDetails.favorite.resourceId.videoId,
                  snippet: item.snippet,
                };
              }
              return videoData;
            })
            .filter(Boolean);
        } else {
          // Process videos from the Videos API (existing logic)
          videosToProcess = data.items;
        }

        const trailers = videosToProcess.filter((item: any) => {
          const title = item.snippet.title.toLowerCase();
          return title.includes("trailer") || title.includes("teaser");
        });

        for (let i = 0; i < trailers.length; i++) {
          const item = trailers[i];
          const existingTrailer = await ctx.runQuery(
            internal.trailers.getByYoutubeId,
            { youtubeId: item.id },
          );
          if (existingTrailer) {
            if (
              !existingUserTrailers.some(
                (userTrailer) => userTrailer.trailerId === existingTrailer._id,
              )
            ) {
              await ctx.runMutation(internal.trailers.createUserTrailer, {
                trailerId: existingTrailer._id,
              });
            }
            // Skip if the trailer already exists
            continue;
          }
          let year: string | undefined;
          const yearMatch = item.snippet.title.match(yearRegex);
          if (yearMatch) {
            year = yearMatch[0];
          }
          const parsedTitle = item.snippet.title
            .split(dividerRegex)[0]
            .trim()
            .replace(/trailer/i, "")
            .replace(/teaser/i, "")
            .replace(/official/i, "");
          const movieId = await ctx.runAction(internal.movies.search, {
            name: parsedTitle,
            year: year,
          });
          const trailerId = await ctx.runMutation(internal.trailers.create, {
            youtubeId: item.id,
            movieId: movieId ?? undefined,
            title: item.snippet.title,
            parsedTitle: parsedTitle,
            thumbnail: item.snippet.thumbnails.default.url,
            tags: item.snippet.tags || [],
            categoryId: item.snippet.categoryId,
          });
          await ctx.runMutation(internal.trailers.createUserTrailer, {
            trailerId,
          });
        }
      }
      if ("nextPageToken" in data && data.nextPageToken !== pageToken) {
        pageToken = data.nextPageToken;
        page++;
      } else {
        pageToken = undefined;
      }
    } while (!doneSyncing && pageToken !== undefined && page < 50);
    await ctx.runMutation(internal.youtube.updateSync, {
      id: syncId,
      status: "done",
    });
    return "done";
  },
});
