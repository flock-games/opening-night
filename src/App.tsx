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

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800">
        Opening Night - Get reminders for movies you forgot you wanted to see
      </header>
      <main>
        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
        <Authenticated>
          <UserButton
            userProfileProps={{
              additionalOAuthScopes: {
                google: ["https://www.googleapis.com/auth/youtube.readonly"],
              },
            }}
          />
          <YouTubeVideos />
          {/* <MovieSearch /> */}
          <TrailersList />
        </Authenticated>
        <AuthLoading>
          <p>Still loading</p>
        </AuthLoading>
      </main>
    </>
  );
}

// function MovieSearch() {
//   const search = useAction(api.movies.search);
//   const [query, setQuery] = useState("");

//   const handleSearch = async () => {
//     await search({ name: query });
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//         placeholder="Search for movies..."
//       />
//       <button onClick={handleSearch}>Search</button>
//     </div>
//   );
// }

function TrailersList() {
  const trailers = useQuery(api.trailers.fetch);
  return (
    <div>
      {trailers?.map((trailer) => (
        <div key={trailer._id} className="flex gap-2 p-4 border-b">
          <div className="w-64">{trailer.parsedTitle}</div>
          <div>
            <img src={trailer.thumbnail} alt={trailer.title} />
            <em>{trailer.title}</em>
            <br />
            <a
              href={`https://www.youtube.com/watch?v=${trailer.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch Trailer
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function YouTubeVideos() {
  const getLikes = useAction(api.youtube.getLikes);

  const fetchVideos = async () => {
    // Fetch videos from YouTube API
    const res = await getLikes({});
    console.log("Fetched videos:", res);
  };

  return (
    <div>
      <button onClick={() => fetchVideos()}>Fetch</button>
    </div>
  );
}
