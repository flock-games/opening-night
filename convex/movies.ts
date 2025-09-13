import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const apiRoot = "https://api.themoviedb.org/3";

// Helper function to find or create streaming platform entries
export const findOrCreateStreamingPlatform = internalMutation({
  args: {
    provider_id: v.number(),
    provider_name: v.string(),
    logo_path: v.string(),
    display_priority: v.number(),
  },
  handler: async (ctx, args) => {
    // First try to find existing platform
    const existing = await ctx.db
      .query("streamingPlatforms")
      .withIndex("by_provider_id", (q) => q.eq("provider_id", args.provider_id))
      .first();

    if (existing) {
      // Update if any fields have changed
      if (
        existing.provider_name !== args.provider_name ||
        existing.logo_path !== args.logo_path ||
        existing.display_priority !== args.display_priority
      ) {
        await ctx.db.patch(existing._id, {
          provider_name: args.provider_name,
          logo_path: args.logo_path,
          display_priority: args.display_priority,
        });
      }
      return existing._id;
    }

    // Create new platform
    return await ctx.db.insert("streamingPlatforms", args);
  },
});

// Helper function to get streaming platforms with their details
export const getStreamingPlatformsWithDetails = internalMutation({
  args: {
    platformIds: v.array(v.id("streamingPlatforms")),
  },
  handler: async (ctx, { platformIds }) => {
    const platforms = await Promise.all(
      platformIds.map((id) => ctx.db.get(id)),
    );
    return platforms.filter((p) => p !== null);
  },
});

// Helper function to create multiple streaming platforms and return their IDs
export const createStreamingPlatforms = internalMutation({
  args: {
    platforms: v.array(
      v.object({
        provider_id: v.number(),
        provider_name: v.string(),
        logo_path: v.string(),
        display_priority: v.number(),
      }),
    ),
  },
  handler: async (ctx, { platforms }): Promise<Id<"streamingPlatforms">[]> => {
    const platformIds: Id<"streamingPlatforms">[] = await Promise.all(
      platforms.map(
        async (platform) =>
          await ctx.runMutation(
            internal.movies.findOrCreateStreamingPlatform,
            platform,
          ),
      ),
    );
    return platformIds;
  },
});

export const fetchUserMovies = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User is not authenticated");
    }

    let userTrailers = await ctx.db
      .query("userTrailers")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .collect();

    userTrailers = userTrailers.filter(
      (userTrailer) => userTrailer.dismissed !== true,
    );

    const trailers = await Promise.all(
      userTrailers.map(async (userTrailer) => {
        const trailer = await ctx.db.get(userTrailer.trailerId);
        if (!trailer) return null;
        return { ...trailer, userTrailerId: userTrailer._id };
      }),
    ).then((trailers) => trailers.filter((trailer) => trailer !== null));

    const movies = await Promise.all(
      trailers.map(async (trailer) => {
        if (!trailer?.movieId) return null;
        const movie = await ctx.db.get(trailer.movieId);
        if (!movie) return null;

        // Fetch streaming platform details if they exist
        let streamingPlatforms = null;
        if (movie.streamingPlatforms && movie.streamingPlatforms.length > 0) {
          const platforms = await Promise.all(
            movie.streamingPlatforms.map((id) => {
              return ctx.db.get(id);
            }),
          );
          streamingPlatforms = platforms.filter((p) => p !== null);
        }

        return {
          ...movie,
          streamingPlatforms,
          userTrailerId: trailer.userTrailerId,
          trailer: {
            youtubeId: trailer.youtubeId,
            title: trailer.title,
          },
        };
      }),
    ).then((movies) => movies.filter((movie) => movie !== null));

    return movies;
  },
});

export const search = internalAction({
  args: {
    name: v.string(),
    year: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Searching for movie:", args.name, args.year);
    const { name, year } = args;

    const url = `${apiRoot}/search/movie?query=${name}&include_adult=false&language=en-US&page=1${
      year ? `&year=${year}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data || !data.results || data.results.length === 0) {
      return null;
    }

    // Sort data by popularity
    const bestMatch = data.results.sort(
      (a: any, b: any) => b.popularity - a.popularity,
    )[0];

    // Fetch streaming platforms for the movie
    let streamingPlatformIds;
    try {
      const streamingPlatforms = await ctx.runAction(
        internal.movies.fetchStreamingProvidersFromTMDB,
        {
          tmdbId: `${bestMatch.id}`,
        },
      );

      if (streamingPlatforms && streamingPlatforms.length > 0) {
        streamingPlatformIds = await ctx.runMutation(
          internal.movies.createStreamingPlatforms,
          {
            platforms: streamingPlatforms,
          },
        );
      }
    } catch (error) {
      console.error(
        `Failed to fetch streaming providers for ${bestMatch.title}:`,
        error,
      );
      streamingPlatformIds = undefined;
    }

    const id: Id<"movies"> = await ctx.runMutation(internal.movies.create, {
      tmdbId: `${bestMatch.id}`,
      title: bestMatch.title,
      releaseDate: bestMatch.release_date,
      overview: bestMatch.overview,
      posterPath: bestMatch.poster_path,
      streamingPlatforms: streamingPlatformIds,
    });

    return id;
  },
});

export const create = internalMutation({
  args: {
    tmdbId: v.string(),
    title: v.string(),
    releaseDate: v.optional(v.string()),
    overview: v.optional(v.string()),
    posterPath: v.optional(v.string()),
    streamingPlatforms: v.optional(v.array(v.id("streamingPlatforms"))),
  },
  handler: async (ctx, args): Promise<Id<"movies">> => {
    const {
      tmdbId,
      title,
      releaseDate,
      overview,
      posterPath,
      streamingPlatforms,
    } = args;

    const id = await ctx.db.insert("movies", {
      tmdbId,
      title,
      releaseDate: releaseDate ?? "",
      overview: overview ?? "",
      posterPath: posterPath ?? "",
      streamingPlatforms: streamingPlatforms,
      streamingPlatformsLastUpdated: streamingPlatforms
        ? new Date().toISOString()
        : undefined,
    });

    return id;
  },
});

export const updateUnreleasedMoviesDates = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    updatedCount: number;
    errorCount: number;
    totalChecked: number;
  }> => {
    console.log("Starting weekly movie release date update...");

    // Get all movies that haven't been released yet (release date >= today)
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const movies: any[] = await ctx.runMutation(
      internal.movies.getUnreleasedMovies,
      { today },
    );

    console.log(`Found ${movies.length} unreleased movies to check`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const movie of movies) {
      try {
        const updatedMovie = await ctx.runAction(
          internal.movies.fetchMovieFromTMDB,
          {
            tmdbId: movie.tmdbId,
          },
        );

        if (updatedMovie && updatedMovie.releaseDate !== movie.releaseDate) {
          await ctx.runMutation(internal.movies.updateMovieReleaseDate, {
            movieId: movie._id,
            releaseDate: updatedMovie.releaseDate,
          });
          updatedCount++;
          console.log(
            `Updated ${movie.title}: ${movie.releaseDate} -> ${updatedMovie.releaseDate}`,
          );
        }
      } catch (error) {
        errorCount++;
        console.error(`Failed to update movie ${movie.title}:`, error);
      }
    }

    console.log(
      `Movie update complete: ${updatedCount} updated, ${errorCount} errors`,
    );
    return { updatedCount, errorCount, totalChecked: movies.length };
  },
});

export const getUnreleasedMovies = internalMutation({
  args: { today: v.string() },
  handler: async (ctx, { today }) => {
    const movies = await ctx.db.query("movies").collect();

    // Filter movies that haven't been released yet or have empty release dates
    return movies.filter((movie) => {
      if (!movie.releaseDate || movie.releaseDate === "") {
        return true; // Include movies with no release date
      }
      return movie.releaseDate >= today;
    });
  },
});

export const fetchMovieFromTMDB = internalAction({
  args: { tmdbId: v.string() },
  handler: async (_ctx, { tmdbId }) => {
    const url = `${apiRoot}/movie/${tmdbId}?language=en-US`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch movie from TMDB: ${response.statusText}`,
      );
    }

    const data = await response.json();

    return {
      tmdbId: `${data.id}`,
      title: data.title,
      releaseDate: data.release_date || "",
      overview: data.overview || "",
      posterPath: data.poster_path || "",
    };
  },
});

export const fetchStreamingProvidersFromTMDB = internalAction({
  args: { tmdbId: v.string() },
  handler: async (_ctx, { tmdbId }) => {
    const url = `${apiRoot}/movie/${tmdbId}/watch/providers`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch streaming providers from TMDB: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Get US region providers - focus on flatrate (subscription) and rent options
    const usProviders = data.results?.US;
    if (!usProviders) {
      return [];
    }

    // Combine flatrate and rent providers, prioritizing flatrate
    const providers = [];
    if (usProviders.flatrate) {
      providers.push(...usProviders.flatrate);
    }
    if (usProviders.rent) {
      providers.push(...usProviders.rent);
    }

    // Remove duplicates and return provider info
    const uniqueProviders = providers.filter(
      (provider, index, self) =>
        index === self.findIndex((p) => p.provider_id === provider.provider_id),
    );

    return uniqueProviders.map((provider) => ({
      provider_id: provider.provider_id,
      provider_name: provider.provider_name,
      logo_path: provider.logo_path,
      display_priority: provider.display_priority,
    }));
  },
});

export const updateMovieReleaseDate = internalMutation({
  args: {
    movieId: v.id("movies"),
    releaseDate: v.string(),
  },
  handler: async (ctx, { movieId, releaseDate }) => {
    await ctx.db.patch(movieId, { releaseDate });
  },
});

export const updateMovieStreamingPlatforms = internalMutation({
  args: {
    movieId: v.id("movies"),
    streamingPlatforms: v.array(
      v.object({
        provider_id: v.number(),
        provider_name: v.string(),
        logo_path: v.string(),
        display_priority: v.number(),
      }),
    ),
  },
  handler: async (ctx, { movieId, streamingPlatforms }) => {
    // Convert streaming platform objects to IDs
    const platformIds = await ctx.runMutation(
      internal.movies.createStreamingPlatforms,
      {
        platforms: streamingPlatforms,
      },
    );

    await ctx.db.patch(movieId, {
      streamingPlatforms: platformIds,
      streamingPlatformsLastUpdated: new Date().toISOString(),
    });
  },
});

export const getReleasedMovies = internalMutation({
  args: { today: v.string() },
  handler: async (ctx, { today }) => {
    const movies = await ctx.db.query("movies").collect();

    // Filter movies that have been released (release date < today) and have a valid release date
    return movies.filter((movie) => {
      if (!movie.releaseDate || movie.releaseDate === "") {
        return false; // Skip movies with no release date
      }
      return movie.releaseDate < today;
    });
  },
});

export const updateReleasedMoviesStreamingPlatforms = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    updatedCount: number;
    errorCount: number;
    totalChecked: number;
  }> => {
    console.log(
      "Starting weekly streaming platforms update for released movies...",
    );

    // Get all movies that have been released (release date < today)
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const movies: any[] = await ctx.runMutation(
      internal.movies.getReleasedMovies,
      { today },
    );

    console.log(`Found ${movies.length} released movies to check`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const movie of movies) {
      try {
        // Check if we should update (either never updated or updated more than a week ago)
        const shouldUpdate =
          !movie.streamingPlatformsLastUpdated ||
          new Date(movie.streamingPlatformsLastUpdated) <
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        if (!shouldUpdate) {
          continue;
        }

        const streamingPlatforms = await ctx.runAction(
          internal.movies.fetchStreamingProvidersFromTMDB,
          {
            tmdbId: movie.tmdbId,
          },
        );

        await ctx.runMutation(internal.movies.updateMovieStreamingPlatforms, {
          movieId: movie._id,
          streamingPlatforms: streamingPlatforms,
        });

        updatedCount++;
        console.log(
          `Updated streaming platforms for ${movie.title}: ${streamingPlatforms.length} providers`,
        );
      } catch (error) {
        errorCount++;
        console.error(
          `Failed to update streaming platforms for movie ${movie.title}:`,
          error,
        );
      }
    }

    console.log(
      `Streaming platforms update complete: ${updatedCount} updated, ${errorCount} errors`,
    );
    return { updatedCount, errorCount, totalChecked: movies.length };
  },
});

// Migration function to convert existing movie streaming platforms to the new structure
export const migrateStreamingPlatforms = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    migratedCount: number;
    errorCount: number;
    totalChecked: number;
  }> => {
    console.log("Starting migration of streaming platforms...");

    // Get all movies
    const movies: any[] = await ctx.runQuery(
      internal.movies.getAllMoviesForMigration,
    );

    let migratedCount = 0;
    let errorCount = 0;

    for (const movie of movies) {
      try {
        // Check if movie has old format streaming platforms (array of objects)
        if (
          movie.streamingPlatforms &&
          Array.isArray(movie.streamingPlatforms) &&
          movie.streamingPlatforms.length > 0 &&
          typeof movie.streamingPlatforms[0] === "object" &&
          "provider_id" in movie.streamingPlatforms[0]
        ) {
          console.log(
            `Migrating streaming platforms for movie: ${movie.title}`,
          );

          // Convert old format to new format
          const platformIds = await ctx.runMutation(
            internal.movies.createStreamingPlatforms,
            {
              platforms: movie.streamingPlatforms as any,
            },
          );

          // Update the movie with new platform IDs
          await ctx.runMutation(
            internal.movies.updateMovieStreamingPlatformIds,
            {
              movieId: movie._id,
              streamingPlatformIds: platformIds,
            },
          );

          migratedCount++;
        }
      } catch (error) {
        console.error(
          `Failed to migrate streaming platforms for movie ${movie.title}:`,
          error,
        );
        errorCount++;
      }
    }

    console.log(
      `Migration complete: ${migratedCount} movies migrated, ${errorCount} errors`,
    );
    return { migratedCount, errorCount, totalChecked: movies.length };
  },
});

// Helper function for migration
export const getAllMoviesForMigration = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("movies").collect();
  },
});

// Helper function for migration
export const updateMovieStreamingPlatformIds = internalMutation({
  args: {
    movieId: v.id("movies"),
    streamingPlatformIds: v.array(v.id("streamingPlatforms")),
  },
  handler: async (ctx, { movieId, streamingPlatformIds }) => {
    await ctx.db.patch(movieId, {
      streamingPlatforms: streamingPlatformIds,
    });
  },
});

// Helper function to test the new streaming platforms structure
export const testStreamingPlatformsStructure = internalQuery({
  args: {},
  handler: async (ctx) => {
    const movies = await ctx.db.query("movies").take(5);
    const streamingPlatforms = await ctx.db
      .query("streamingPlatforms")
      .take(10);

    return {
      totalMovies: movies.length,
      totalStreamingPlatforms: streamingPlatforms.length,
      sampleMovies: movies.map((movie) => ({
        title: movie.title,
        hasStreamingPlatforms: !!movie.streamingPlatforms,
        platformCount: movie.streamingPlatforms?.length || 0,
      })),
      samplePlatforms: streamingPlatforms.map((platform) => ({
        provider_id: platform.provider_id,
        provider_name: platform.provider_name,
      })),
    };
  },
});
