import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";
import { MovieCard } from "./MovieCard";

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
      <h2 className="mb-2 text-2xl font-black">
        <FontAwesomeIcon
          className="mr-2"
          size="lg"
          icon={byPrefixAndName.faslr[icon]}
        />
        {title}
      </h2>
      <div className="flex flex-wrap bg-slate-800 rounded-lg mb-12 py-1 md:py-2 px-1 gap-y-4">
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
