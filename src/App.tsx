"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import {
  Loading,
  LandingPage,
  UserMovies,
  SyncYoutubeLikesButton,
} from "./components";

export default function App() {
  return (
    <>
      <header className="sticky flex justify-between top-0 z-10 bg-light dark:bg-dark px-4 lg:px-8 py-4">
        <div>
          <h1 className="text-2xl font-black text-amber-300">Opening Night</h1>
        </div>
        <Authenticated>
          <div className="flex items-center gap-4">
            <SyncYoutubeLikesButton />

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
