import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createClerkClient } from "@clerk/backend";

export const getYoutubeLikes = action({
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_CLIENT_SECRET,
    });

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return;
    }
    const clerkResponse = await clerkClient.users.getUserOauthAccessToken(
      userId,
      "google",
    );
    const accessToken = clerkResponse.data[0].token;

    let trailersData: any[] = [];
    let pageToken = undefined;
    let page = 1;
    do {
      if (page % 10 === 0) {
        console.log(`Fetching page ${page++} of YouTube likes...`);
      }
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
        const pageTrailers = data.items
          .filter((item: any) =>
            item.snippet.title.toLowerCase().includes("trailer"),
          )
          .map((item: any) => {
            return {
              title: item.snippet.title,
              tags: item.snippet.tags || [],
              categoryId: item.snippet.categoryId,
            };
          });
        trailersData = trailersData.concat(pageTrailers);
      }
      if ("nextPageToken" in data && data.nextPageToken !== pageToken) {
        pageToken = data.nextPageToken;
        page++;
      } else {
        pageToken = undefined;
      }
    } while (pageToken !== undefined && page < 100);
    console.log("Trailers Data:", trailersData);
    return trailersData;
  },
});
