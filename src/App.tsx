"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useAction,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInButton, UserButton } from "@clerk/clerk-react";

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800">
        Now Playing
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
        </Authenticated>
        <AuthLoading>
          <p>Still loading</p>
        </AuthLoading>
      </main>
    </>
  );
}

function YouTubeVideos() {
  const videos = useAction(api.myFunctions.getYoutubeLikes);

  const fetchVideos = async () => {
    // Fetch videos from YouTube API
    const res = await videos({});
    console.log("Fetched videos:", res);
  };

  return (
    <div>
      <button onClick={() => fetchVideos()}>Fetch</button>
    </div>
  );
}
