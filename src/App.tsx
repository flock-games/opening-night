"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { UserButton } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TmdbLogo from "./images/tmdb.svg";
import LogoLight from "./images/opening-night-logo-light.png";
import LogoDark from "./images/opening-night-logo-dark.png";
import {
  Loading,
  LandingPage,
  UserMovies,
  SyncYoutubeLikesButton,
  NotificationToggle,
  FeedbackButton,
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
      <header className="sticky top-0 z-20 bg-light dark:bg-dark py-4">
        <div className="flex justify-between mx-1 md:mx-4 lg:mx-auto lg:max-w-4xl">
          <div>
            <Link to="/">
              {/* Light mode logo (dark text/elements) */}
              <img
                src={LogoLight}
                alt="Opening Night"
                className="h-8 dark:hidden hover:opacity-80 transition-opacity cursor-pointer"
              />
              {/* Dark mode logo (light text/elements) */}
              <img
                src={LogoDark}
                alt="Opening Night"
                className="h-8 hidden dark:block hover:opacity-80 transition-opacity cursor-pointer"
              />
            </Link>
          </div>
          <Authenticated>
            <div className="flex items-center">
              <div className="mr-2">
                <NotificationToggle />
                <SyncYoutubeLikesButton />
                <FeedbackButton />
              </div>
              <UserButton
                userProfileProps={{
                  additionalOAuthScopes: {
                    google: [
                      "https://www.googleapis.com/auth/youtube.readonly",
                    ],
                  },
                }}
              />
            </div>
          </Authenticated>
        </div>
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
          <div className="flex justify-center  space-x-6 mb-2">
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
            <a href="https://www.themoviedb.org/" target="_blank">
              <img
                src={TmdbLogo}
                alt="TMDB Logo"
                className="inline-block h-3 mr-1"
              />
            </a>
          </div>
          <p className="text-slate-500 dark:text-slate-500">
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
            <br />
            Something by <a href="https://tylerdawson.dev">Tyler Dawson</a>
            <br />© {new Date().getFullYear()} Opening Night. All rights
            reserved.
          </p>
        </div>
      </footer>
    </Router>
  );
}
