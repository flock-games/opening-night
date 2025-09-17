import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
// Temporarily disabled FontAwesome
// Temporarily disabled FontAwesome icons
import { useEffect, useRef } from "react";
import { formatReleaseDate } from "../utils/dateUtils";
import { MoviePlatformList } from "./MoviePlatformList";

export function MovieCard({
  movie,
  includeDate,
  isExpanded = false,
}: {
  movie: any;
  includeDate?: boolean;
  isExpanded?: boolean;
}) {
  const dismiss = useMutation(api.trailers.dismissUserTrailer);
  const sendDismissedEmail = useMutation(
    api.emails.sendSuggestionDismissedEmail,
  );
  const cardRef = useRef<HTMLDivElement>(null);

  const displayDate = formatReleaseDate(movie.releaseDate);

  const dismissSuggestion = async () => {
    await dismiss({ userTrailerId: movie.userTrailerId });
    await sendDismissedEmail({ userTrailerId: movie.userTrailerId });
  };

  // Scroll to the card when it becomes expanded
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isExpanded]);

  return (
    <div
      ref={cardRef}
      className={`p-2 group cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-200 rounded-lg hover:scale-105 relative ${
        isExpanded
          ? "flex flex-col md:flex-row gap-6 md:items-start bg-slate-300 dark:bg-slate-700 scale-105"
          : ""
      }`}
    >
      <div className={isExpanded ? "flex-shrink-0" : ""}>
        <img
          src={`https://image.tmdb.org/t/p/w500/${movie.posterPath}`}
          alt={movie.title}
          className={`rounded-lg shadow-lg ${
            isExpanded
              ? "w-full md:w-48 h-auto md:h-72 max-h-80 object-cover"
              : "mb-2 w-full"
          }`}
        />
      </div>

      <div className={isExpanded ? "flex-1 min-w-0" : ""}>
        <h3
          className={`font-semibold ${
            isExpanded
              ? "text-2xl  text-slate-700 dark:text-amber-300"
              : "text-lg line-clamp-1"
          }`}
        >
          {movie.title}
        </h3>

        {includeDate && (
          <p
            className={`font-regular ${
              isExpanded
                ? "text-lg text-slate-500 dark:text-slate-200"
                : "text-md"
            }`}
          >
            {displayDate}
          </p>
        )}

        <MoviePlatformList
          platforms={movie.streamingPlatforms}
          isExpanded={isExpanded}
        />

        <p
          className={`text-slate-700 dark:text-slate-300 ${
            isExpanded
              ? "text-base leading-relaxed mt-2"
              : "text-sm line-clamp-4"
          }`}
        >
          {movie.overview}
        </p>

        {/* Trailer section - hidden on mobile, shown on desktop within text column */}
        {isExpanded && movie.trailer && (
          <div className="hidden md:block mt-6">
            <p className="text-sm text-slate-700 dark:text-slate-400 italic mb-2">
              Suggested because you liked:
            </p>
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${movie.trailer.youtubeId}`}
                title={movie.trailer.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        )}

        {isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissSuggestion();
            }}
            className="mt-6 px-2 py-1 cursor-pointer bg-slate-900 hover:bg-rose-500 text-rose-200 hover:text-white rounded-lg transition-colors duration-200 flex items-center gap-1 text-md"
          >
            ❌ ICON
            Remove
          </button>
        )}
      </div>

      {/* Trailer section - full width on mobile only, below all other content */}
      {isExpanded && movie.trailer && (
        <div className="block md:hidden w-full mt-6">
          <p className="text-sm text-slate-700 dark:text-slate-400 italic mb-2">
            Suggested because you liked:
          </p>
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${movie.trailer.youtubeId}`}
              title={movie.trailer.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="md:hidden group-hover:block rounded-full bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white absolute top-4 right-4 p-1 z-10">
          <svg
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              dismissSuggestion();
            }}
            className="w-5 h-5 transition-colors duration-200 cursor-pointer"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      )}
    </div>
  );
}
