import { useState } from "react";
// Temporarily disabled FontAwesome
// Temporarily disabled FontAwesome icons
import { MovieCard } from "./MovieCard";
import { EmailMovieListButton } from "./EmailMovieListButton";

export function MovieSection({
  title,
  icon,
  movies,
  includeDate = false,
}: {
  title: string;
  icon: string;
  movies: any[];
  includeDate?: boolean;
}) {
  // Use state to keep track of an expanded movie
  const [expandedMovie, setExpandedMovie] = useState<string | null>(null);

  const movieClicked = (movieId: string) => {
    if (expandedMovie === movieId) {
      setExpandedMovie(null);
    } else {
      setExpandedMovie(movieId);
    }
  };

  return (
    <div className="mb-4 mx-1 md:mx-4 lg:mx-auto lg:max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-slate-600 dark:text-slate-100">
          <FontAwesomeIcon
            className="mr-1"
            size="lg"
            icon={byPrefixAndName.faslr[icon]}
          />
          {title}
        </h2>
        <EmailMovieListButton movies={movies} listTitle={title} />
      </div>
      <div className="flex flex-wrap bg-slate-200 dark:bg-slate-800 rounded-lg mb-12 py-1 md:py-2 px-1 gap-y-4">
        {movies.map((movie) => (
          <div
            onClick={() => movieClicked(movie._id)}
            className={`px-none md:px-2   ${
              expandedMovie === movie._id
                ? "w-full px-none"
                : "w-1/2 md:w-1/4 lg:w-1/5"
            }`}
            key={movie._id}
          >
            <MovieCard
              movie={movie}
              includeDate={includeDate}
              isExpanded={expandedMovie === movie._id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
