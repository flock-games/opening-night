"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useAction,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";
import { useState } from "react";

export default function App() {
  return (
    <>
      <header className="sticky flex justify-between top-0 z-10 bg-light dark:bg-dark px-4 lg:px-8 py-4">
        <div>
          <h1 className="text-2xl font-black text-amber-300">Opening Night</h1>
        </div>
        <Authenticated>
          <div className="flex items-center gap-4">
            <SyncYoutubeLikes />

            <UserButton
              userProfileProps={{
                additionalOAuthScopes: {
                  google: ["https://www.googleapis.com/auth/youtube.readonly"],
                },
              }}
            />
          </div>
        </Authenticated>
        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
      </header>
      <main>
        <Authenticated>
          <UserMovies />
        </Authenticated>
        <Unauthenticated>
          <LandingPage />
        </Unauthenticated>
        <AuthLoading>
          <Loading />
        </AuthLoading>
      </main>
    </>
  );
}

function Loading() {
  return (
    <div className="my-4 mx-4 lg:mx-auto max-w-2xl">
      <h2 className="text-2xl mt-16 mb-8 font-black">Loading...</h2>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="my-4 mx-4 lg:mx-auto max-w-2xl">
      <h2 className="text-2xl mt-16 mb-8 font-black">
        Find movies you want to see with{" "}
        <span className="text-amber-300">Opening Night</span>
      </h2>
      <p className="mb-4">
        Opening Night is a movie discovery app that helps you find upcoming and
        released movies based on trailers you liked on YouTube. Easily set
        reminders and we'll email you when the movie is about to be released.
      </p>
      <p className="mb-4">Sign in with Google to get started!</p>
    </div>
  );
}

function UserMovies() {
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
    <div className="my-4 mx-4 lg:mx-auto max-2-2xl">
      {upcomingMovies.length > 0 && (
        <MovieSection
          title="Coming Soon"
          icon="calendar"
          movies={upcomingMovies}
          includeDate={true}
        />
      )}
      {releasedMovies.length > 0 && (
        <MovieSection title="Released" icon="tv" movies={releasedMovies} />
      )}
    </div>
  );
}

function NoUserMovies() {
  return (
    <div className="my-4 mx-4 lg:mx-auto max-2-2xl">
      <div className="mb-4 mx-4 lg:mx-auto lg:max-w-4xl text-center">
        <h2 className="text-2xl mt-16 mb-8 font-black">No movies yet...</h2>
        <SyncYoutubeLikes />
        <p className=" mb-2">Try syncing your YouTube likes.</p>
        <p className="text-stone-400 text-sm">
          Opening Night is still in beta. If it fails to identify movies that
          should be here, please let us know!
        </p>
      </div>
    </div>
  );
}

function MovieSection({
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
    <div className="mb-4 mx-4 lg:mx-auto lg:max-w-4xl">
      <h2 className="mb-2 text-2xl font-black">
        <FontAwesomeIcon
          className="mr-2"
          size="lg"
          icon={byPrefixAndName.faslr[icon]}
        />
        {title}
      </h2>
      <div className="flex flex-wrap bg-stone-800 rounded-lg mb-12 py-2 px-1 gap-y-4">
        {movies.map((movie) => (
          <div
            onClick={() => movieClicked(movie._id)}
            className={`px-2 transition-all  ${
              expandedMovie === movie._id
                ? "w-full px-none"
                : "w-1/2 md:w-1/4 lg:w-1/5"
            }`}
            key={movie._id}
          >
            <MovieCard movie={movie} includeDate={includeDate} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MovieCard({
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
    <div className="p-2 group cursor-pointer hover:bg-stone-700 transition-all duration-200 rounded-lg hover:scale-105 relative">
      <div className="hidden group-hover:block rounded-full bg-stone-800 hover:bg-rose-500 text-stone-400 hover:text-white absolute bottom-2 right-2 p-1">
        <FontAwesomeIcon
          onClick={() => dismissSuggestion()}
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
      <p className="text-sm text-stone-400 line-clamp-4">{movie.overview}</p>
    </div>
  );
}

function SyncYoutubeLikes() {
  const syncLikes = useAction(api.youtube.syncLikes);

  const sync = () => {
    syncLikes({});
  };

  return (
    <div>
      <FontAwesomeIcon
        onClick={() => sync()}
        className="cursor-pointer hover:rotate-180 transition-transform duration-300"
        size="xl"
        icon={byPrefixAndName.faslr["arrows-rotate"]}
      />
    </div>
  );
}
