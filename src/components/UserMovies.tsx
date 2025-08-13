import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { NoUserMovies } from "./NoUserMovies";
import { MovieSection } from "./MovieSection";

export function UserMovies() {
  const movies = useQuery(api.movies.fetchUserMovies);
  if (!movies) return;
  if (!movies.length) {
    return <NoUserMovies />;
  }
  // Released movies should be shown with most recent first
  const releasedMovies = movies
    .filter((movie) => {
      return new Date(movie.releaseDate) < new Date();
    })
    .sort((a, b) => {
      return (
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
    });

  // Upcoming movies should be shown with closest to release first
  const upcomingMovies = movies
    .filter((movie) => {
      return new Date(movie.releaseDate) >= new Date();
    })
    .sort((a, b) => {
      return (
        new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
      );
    });
  return (
    <div className="my-4 mx-2 md:mx-4 lg:mx-auto max-2-2xl">
      {upcomingMovies.length > 0 && (
        <MovieSection
          title="Coming Soon"
          movies={upcomingMovies}
          includeDate={true}
        />
      )}
      {releasedMovies.length > 0 && (
        <MovieSection title="Released" movies={releasedMovies} />
      )}
    </div>
  );
}
