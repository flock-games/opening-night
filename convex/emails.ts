import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { vEmailId, vEmailEvent, Resend } from "@convex-dev/resend";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
  onEmailEvent: internal.emails.handleEmailEvent,
});

export const sendSuggestionDismissedEmail = mutation({
  args: { userTrailerId: v.id("userTrailers") },
  handler: async (ctx, args) => {
    await resend.sendEmail(ctx, {
      from: "Test <onboarding@resend.dev>",
      to: "tyler@flock.games",
      subject: "Suggestion dismissed",
      html: `The suggestion "${args.userTrailerId}" was dismissed.`,
    });
  },
});

export const getUserNotificationSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const userNotification = await ctx.db
      .query("userNotifications")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    return {
      enabled: userNotification?.enabled ?? false,
      email: userNotification?.email,
    };
  },
});

export const toggleNotifications = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const email = identity.email;

    if (!email) {
      throw new Error("User email not found");
    }

    // Check if user notification record exists
    const existingNotification = await ctx.db
      .query("userNotifications")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existingNotification) {
      // Update existing record
      await ctx.db.patch(existingNotification._id, {
        enabled: args.enabled,
        email: email,
      });
    } else {
      // Create new record
      await ctx.db.insert("userNotifications", {
        userId: userId,
        enabled: args.enabled,
        email: email,
      });
    }

    return { success: true };
  },
});

export const sendDailyReleaseNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    // Find movies releasing today
    const allMovies = await ctx.db.query("movies").collect();
    const releasingToday = allMovies.filter(
      (movie) => movie.releaseDate === today,
    );

    console.log(
      `Found ${releasingToday.length} movies releasing today: ${today}`,
    );

    for (const movie of releasingToday) {
      // Find trailers for this movie
      const trailers = await ctx.db
        .query("trailers")
        .withIndex("by_movie_id", (q) => q.eq("movieId", movie._id))
        .collect();

      for (const trailer of trailers) {
        // Find users who have liked this trailer and not dismissed it
        const userTrailers = await ctx.db
          .query("userTrailers")
          .withIndex("by_trailer_id", (q) => q.eq("trailerId", trailer._id))
          .collect();

        const interestedUsers = userTrailers.filter(
          (userTrailer) => userTrailer.dismissed !== true,
        );

        console.log(
          `Found ${interestedUsers.length} interested users for movie: ${movie.title}`,
        );

        // Send emails to interested users
        for (const userTrailer of interestedUsers) {
          try {
            // Check if user has notifications enabled and get their email
            const userNotification = await ctx.db
              .query("userNotifications")
              .withIndex("by_user_id", (q) =>
                q.eq("userId", userTrailer.userId),
              )
              .first();

            // Skip if user doesn't have notifications enabled or no email found
            if (!userNotification || !userNotification.enabled) {
              console.log(
                `Skipping user ${userTrailer.userId} - notifications disabled or not found`,
              );
              continue;
            }

            const tmdbUrl = `https://www.themoviedb.org/movie/${movie.tmdbId}`;

            await resend.sendEmail(ctx, {
              from: "Opening Night <noreply@updates.openingnight.app>",
              to: userNotification.email,
              subject: `${movie.title} releases today!`,
              html: `
                <h2>${movie.title} releases today!</h2>
                <p>Great news! The movie "${movie.title}" that you were interested in is scheduled to release today.</p>
                
                <div style="margin: 20px 0;">
                  <img src="https://image.tmdb.org/t/p/w300${movie.posterPath}" alt="${movie.title}" style="max-width: 200px; border-radius: 8px;" />
                </div>
                
                <p><strong>Overview:</strong> ${movie.overview}</p>
                
                <p>
                  <a href="${tmdbUrl}" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    View on TMDB
                  </a>
                </p>
                <p>
                  <a href="https://www.youtube.com/watch?v=${trailer.youtubeId}" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Watch Trailer
                  </a>
                </p>
                <p>Thank you for using Opening Night!</p>
                You can manage your notifications on <a href="https://openingnight.app" style="color: #f59e0b;">Opening Night</a>
              `,
            });

            console.log(
              `Sent release notification for ${movie.title} to user ${userTrailer.userId}`,
            );
          } catch (error) {
            console.error(
              `Failed to send email for movie ${movie.title} to user ${userTrailer.userId}:`,
              error,
            );
          }
        }
      }
    }
  },
});

export const sendMovieList = mutation({
  args: {
    movies: v.array(
      v.object({
        _id: v.id("movies"),
        title: v.string(),
        overview: v.string(),
        posterPath: v.string(),
        releaseDate: v.string(),
        tmdbId: v.string(),
      }),
    ),
    listTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const email = identity.email;
    if (!email) {
      throw new Error("User email not found");
    }

    // Generate HTML table for movies
    const moviesHtml = args.movies
      .map((movie) => {
        const tmdbUrl = `https://www.themoviedb.org/movie/${movie.tmdbId}`;
        const isUnreleased = new Date(movie.releaseDate) >= new Date();
        const displayDate = isUnreleased
          ? new Date(movie.releaseDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : null;

        return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 16px; vertical-align: top;">
            <img src="https://image.tmdb.org/t/p/w200${movie.posterPath}" 
                 alt="${movie.title}" 
                 style="width: 100px; border-radius: 8px;" />
          </td>
          <td style="padding: 16px; vertical-align: top;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">
              <a href="${tmdbUrl}" style="color: #1f2937; text-decoration: none;">${movie.title}</a>
            </h3>
            ${isUnreleased ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-weight: 600;">Releases: ${displayDate}</p>` : ""}
            <p style="margin: 0; color: #374151; line-height: 1.5;">${movie.overview}</p>
            <p style="margin: 16px 0 0 0;">
              <a href="${tmdbUrl}" 
                 style="background-color: #f59e0b; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View on TMDB
              </a>
            </p>
          </td>
        </tr>
      `;
      })
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #1f2937; margin-bottom: 24px;">${args.listTitle}</h1>
        <p style="color: #6b7280; margin-bottom: 32px;">Here's your movie list from Opening Night:</p>
        
        <table style="width: 100%; border-collapse: collapse; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          ${moviesHtml}
        </table>
        
        <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
          Thank you for using Opening Night!<br>
          <a href="https://openingnight.app" style="color: #f59e0b;">Visit Opening Night</a>
        </p>
      </div>
    `;

    await resend.sendEmail(ctx, {
      from: "Opening Night <noreply@updates.openingnight.app>",
      to: email,
      subject: `Your ${args.listTitle} from Opening Night`,
      html: html,
    });

    return { success: true };
  },
});

export const handleEmailEvent = internalMutation({
  args: {
    id: vEmailId,
    event: vEmailEvent,
  },
  handler: async (_, args) => {
    console.log("Got called back!", args.id, args.event);
    // Probably do something with the event if you care about deliverability!
  },
});
