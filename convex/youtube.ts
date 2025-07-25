import { action } from "./_generated/server";
import { createClerkClient } from "@clerk/backend";
import { internal } from "./_generated/api";

const yearRegex = /(\d{4})/;
const dividerRegex = /[|:(-]/;

export const getLikes = action({
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_CLIENT_SECRET,
    });

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User is not authenticated");
    }
    const clerkResponse = await clerkClient.users.getUserOauthAccessToken(
      identity.subject,
      "google",
    );
    const accessToken = clerkResponse.data[0].token;

    let pageToken = undefined;
    let page = 1;
    do {
      let url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&myRating=like&maxResults=50`;
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

      if ("items" in data) {
        data.items
          .filter((item: any) => {
            const title = item.snippet.title.toLowerCase();
            return title.includes("trailer") || title.includes("teaser");
          })
          .forEach(async (item: any) => {
            ctx.runMutation(internal.trailers.create, {
              id: item.id,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails.default.url,
              tags: item.snippet.tags || [],
              categoryId: item.snippet.categoryId,
            });
          });
      }
      if ("nextPageToken" in data && data.nextPageToken !== pageToken) {
        pageToken = data.nextPageToken;
        page++;
      } else {
        pageToken = undefined;
      }
    } while (pageToken !== undefined && page < 100);
    return "done";
  },
});
