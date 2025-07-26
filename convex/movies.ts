import { v } from "convex/values";
import { action, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const apiRoot = "https://api.themoviedb.org/3";

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

    await ctx.runMutation(internal.movies.create, {
      tmdbId: `${bestMatch.id}`,
      title: bestMatch.title,
      releaseDate: bestMatch.release_date,
      overview: bestMatch.overview,
      posterPath: bestMatch.poster_path,
    });

    return bestMatch;
  },
});

export const create = internalMutation({
  args: {
    tmdbId: v.string(),
    title: v.string(),
    releaseDate: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    overview: v.optional(v.string()),
    posterPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { tmdbId, title, releaseDate, thumbnail, overview, posterPath } =
      args;

    await ctx.db.insert("movies", {
      tmdbId,
      title,
      releaseDate: releaseDate ?? "",
      overview: overview ?? "",
      posterPath: posterPath ?? "",
    });

    return { success: true };
  },
});
