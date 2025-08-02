import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";
import { useState } from "react";
import { toast } from "react-toastify";

export function EmailMovieListButton({
  movies,
  listTitle,
}: {
  movies: any[];
  listTitle: string;
}) {
  const sendMovieList = useMutation(api.emails.sendMovieList);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailList = async () => {
    if (isLoading || movies.length === 0) return;

    setIsLoading(true);
    try {
      await sendMovieList({
        movies: movies.map((movie) => ({
          _id: movie._id,
          title: movie.title,
          overview: movie.overview,
          posterPath: movie.posterPath,
          releaseDate: movie.releaseDate,
          tmdbId: movie.tmdbId,
        })),
        listTitle: listTitle + " movies list",
      });
      toast.success(`${listTitle} list emailed successfully!`);
    } catch (error) {
      console.error("Failed to email movie list:", error);
      toast.error("Failed to email movie list");
    } finally {
      setIsLoading(false);
    }
  };

  if (movies.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleEmailList}
      disabled={isLoading}
      className="group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer dark:hover:bg-slate-700 hover:bg-slate-300 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title={`Email me this ${listTitle.toLowerCase()}`}
    >
      <FontAwesomeIcon
        icon={byPrefixAndName.faslr["envelope"]}
        className={`transition-transform duration-300 group-hover:rotate-15 ${
          isLoading ? "animate-pulse" : ""
        }`}
      />
      Email me this list
    </button>
  );
}
