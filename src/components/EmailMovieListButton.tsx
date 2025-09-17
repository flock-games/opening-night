import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
      onClick={() => void handleEmailList()}
      disabled={isLoading}
      className="group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer dark:hover:bg-slate-700 hover:bg-slate-300 dark:text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title={`Email me this ${listTitle.toLowerCase()}`}
    >
      <svg 
        className={`w-4 h-4 transition-transform duration-300 group-hover:rotate-15 ${
          isLoading ? "animate-pulse" : ""
        }`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Email me this list
    </button>
  );
}
