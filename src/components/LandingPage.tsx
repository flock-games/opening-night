import { SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import ExplanationGraphicDark from "../images/youtube-likes-to-movies-dark.png";
import ExplanationGraphicLight from "../images/youtube-likes-to-movies-light.png";

export function LandingPage() {
  return (
    <div className="mt-8 mb-4 mx-4 lg:mx-auto max-w-4xl flex gap-4">
      <div>
        <h2 className="text-6xl mb-4 font-black">
          Turn YouTube likes into movie nights
        </h2>
        <p className="mb-4 text-xl">
          Opening Night helps you rediscover upcoming and released movies from
          trailers you liked on YouTube. Turn on reminders and we'll email you
          when the movie is about to be released.
        </p>
        <SignInButton>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-8 py-4 cursor-pointer text-2xl">
            Get started!
          </button>
        </SignInButton>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          By signing in, you agree to our{" "}
          <Link to="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
      <div className="hidden md:block w-140">
        <img
          className="hidden dark:block"
          src={ExplanationGraphicDark}
          alt="Turn YouTube likes into movie nights"
        />
        <img
          className="dark:hidden"
          src={ExplanationGraphicLight}
          alt="Turn YouTube likes into movie nights"
        />
      </div>
    </div>
  );
}
