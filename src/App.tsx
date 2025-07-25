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
          <TrailersList />
        </Authenticated>
        <AuthLoading>
          <p>Still loading</p>
        </AuthLoading>
      </main>
    </>
  );
}

function TrailersList() {
  const trailers = useQuery(api.trailers.fetch);
  return (
    <ul>
      {trailers?.map((trailer) => (
        <li key={trailer.id}>{trailer.title}</li>
      ))}
    </ul>
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
