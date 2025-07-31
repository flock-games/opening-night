"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { UserButton } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Loading,
  LandingPage,
  UserMovies,
  SyncYoutubeLikesButton,
  NotificationToggle,
  PrivacyPolicy,
  TermsOfService,
} from "./components";

function HomePage() {
  return (
    <>
      <Authenticated>
        <UserMovies />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
      <AuthLoading>
        <Loading />
      </AuthLoading>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <header className="sticky flex justify-between top-0 z-10 bg-light dark:bg-dark px-4 lg:px-8 py-4">
        <div>
          <Link to="/">
            <h1 className="text-2xl font-black text-slate-700 dark:text-amber-300 hover:text-slate-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
              Opening Night
            </h1>
          </Link>
        </div>
        <Authenticated>
          <div className="flex items-center">
            <div className="mr-2">
              <SyncYoutubeLikesButton />
              <NotificationToggle />
            </div>
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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </main>
      <footer className="bg-slate-100 dark:bg-slate-900 mt-16 py-8 px-4 text-xs">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center space-x-6 mb-2">
            <Link
              to="/privacy"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} Opening Night. All rights reserved.
          </p>
        </div>
      </footer>
    </Router>
  );
}
