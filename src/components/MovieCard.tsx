import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";

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

  const displayDate = new Date(movie.releaseDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dismissSuggestion = async () => {
    await dismiss({ userTrailerId: movie.userTrailerId });
    await sendDismissedEmail({ userTrailerId: movie.userTrailerId });
  };

  return (
    <div
      className={`p-2 group cursor-pointer hover:bg-slate-700 transition-all duration-200 rounded-lg hover:scale-105 relative ${
        isExpanded ? "flex gap-6 items-start" : ""
      }`}
    >
      <div
        className={`rounded-full bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white absolute top-4 right-4 p-1 z-10 ${
          isExpanded ? "block" : "md:hidden group-hover:block"
        }`}
      >
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
      </div>
    </div>
  );
}
