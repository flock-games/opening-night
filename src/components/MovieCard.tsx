import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";
import { useEffect, useRef } from "react";

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

  const displayDate = new Date(movie.releaseDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
      className={`p-2 group cursor-pointer hover:bg-slate-700 transition-all duration-200 rounded-lg hover:scale-105 relative ${
        isExpanded ? "flex gap-6 items-start" : ""
      }`}
    >
      <div className={isExpanded ? "flex-shrink-0" : ""}>
        <img
          src={`https://image.tmdb.org/t/p/w500/${movie.posterPath}`}
          alt={movie.title}
          className={`rounded-lg shadow-lg ${
            isExpanded ? "w-48 h-72 object-cover" : "mb-2 w-full"
          }`}
        />
      </div>

      <div className={isExpanded ? "flex-1 min-w-0" : ""}>
        <h3
          className={`font-semibold ${
            isExpanded ? "text-2xl  text-amber-300" : "text-lg line-clamp-1"
          }`}
        >
          {movie.title}
        </h3>

        {includeDate && (
          <p
            className={`font-regular ${
              isExpanded ? "text-lg text-slate-200" : "text-md"
            }`}
          >
            {displayDate}
          </p>
        )}

        <p
          className={`text-slate-300 ${
            isExpanded
              ? "text-base leading-relaxed mt-4"
              : "text-sm line-clamp-4"
          }`}
        >
          {movie.overview}
        </p>

        {isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissSuggestion();
            }}
            className="mt-6 px-2 py-1 cursor-pointer bg-rose-700 hover:bg-rose-500 text-slate-50 hover:text-white rounded-lg transition-colors duration-200 flex items-center gap-1 text-md"
          >
            <FontAwesomeIcon icon={byPrefixAndName.faslr["trash"]} size="lg" />
            Remove
          </button>
        )}
      </div>

      {!isExpanded && (
        <div className="md:hidden group-hover:block rounded-full bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white absolute top-4 right-4 p-1 z-10">
          <FontAwesomeIcon
            onClick={(e) => {
              e.stopPropagation();
              dismissSuggestion();
            }}
            className="transition-colors duration-200 cursor-pointer"
            size="lg"
            icon={byPrefixAndName.faslr["trash"]}
          />
        </div>
      )}
    </div>
  );
}
