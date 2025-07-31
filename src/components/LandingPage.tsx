import { SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="my-4 mx-4 lg:mx-auto max-w-2xl">
      <h2 className="text-3xl mt-16 mb-4 font-black">
        Remember that movie trailer you liked on YouTube ten months ago?
      </h2>
      <p className="mb-4">Of course you don't.</p>
      <p className="mb-4">
        Opening Night helps you rediscover upcoming and released movies from
        trailers you liked on YouTube. Turn on reminders and we'll email you
        when the movie is about to be released.
      </p>
      <SignInButton>
        <button className="bg-green-600 text-white rounded-lg px-4 py-2 cursor-pointer">
          Sign in with Google to get started!
        </button>
      </SignInButton>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        By signing in, you agree to our{" "}
        <Link to="/privacy" className="underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
