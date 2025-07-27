"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useAction,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";

export default function App() {
  return (
    <>
      <header className="sticky flex justify-between top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800">
        <div>
          <h1>Opening Night</h1>
          <em>Get reminders for movies you forgot you wanted to see</em>
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
      </header>
      <main>
        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
        <Authenticated>
          <UserMovies />
        </Authenticated>
        <AuthLoading>
          <p>Loading...</p>
        </AuthLoading>
      </main>
    </>
  );
}

function UserMovies() {
  const movies = useQuery(api.movies.fetchUserMovies);
  if (!movies) return;
  if (!movies.length) {
    return <p>No movies found.</p>;
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
    <div>
      <h2>
        {" "}
        <FontAwesomeIcon
          className="cursor-pointer"
          size="xl"
          icon={byPrefixAndName.faslr["calendar"]}
        />
        Coming Soon
      </h2>
      <div className="flex flex-wrap gap-4">
        {upcomingMovies.map((movie) => (
          <div className="w-48" key={movie._id}>
            <MovieTile movie={movie} />
          </div>
        ))}
      </div>
      <h2>
        <FontAwesomeIcon
          className="cursor-pointer"
          size="xl"
          icon={byPrefixAndName.faslr["tv"]}
        />
        Released
      </h2>
      <div className="flex flex-wrap gap-4">
        {releasedMovies.map((movie) => (
          <div className="w-48" key={movie._id}>
            <MovieTile movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MovieTile({ movie }: { movie: any }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <a
        href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
        target="_blank"
      >
        <img
          src={`https://image.tmdb.org/t/p/w500/${movie.posterPath}`}
          alt={movie.title}
        />
        {movie.title}
      </a>
      <div>{movie.releaseDate}</div>
      <div>{movie.overview}</div>
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
        className="cursor-pointer"
        size="xl"
        icon={byPrefixAndName.faslr["arrows-rotate"]}
      />
    </div>
  );
}
