import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";

export function MovieCard({
  movie,
  includeDate,
}: {
  movie: any;
  includeDate?: boolean;
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
    <div className="p-2 group cursor-pointer hover:bg-slate-700 transition-all duration-200 rounded-lg hover:scale-105 relative">
      <div className="md:hidden group-hover:block rounded-full bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white absolute top-4 right-4 p-1">
        <FontAwesomeIcon
          onClick={(e) => {
            e.stopPropagation();
            dismissSuggestion();
          }}
          className=" transition-colors duration-200 cursor-pointer"
          size="lg"
          icon={byPrefixAndName.faslr["trash"]}
        />
      </div>

      <img
        src={`https://image.tmdb.org/t/p/w500/${movie.posterPath}`}
        alt={movie.title}
        className="mb-2 rounded-lg shadow-lg"
      />
      <h3 className="text-lg font-semibold line-clamp-1">{movie.title}</h3>

      {includeDate && <p className="text-md font-regular">{displayDate}</p>}
      <p className="text-sm text-slate-300 line-clamp-4">{movie.overview}</p>
    </div>
  );
}
