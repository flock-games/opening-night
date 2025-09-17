import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { ConvexError } from "convex/values";
import { toast } from "react-toastify";

export function SyncYoutubeLikesButton() {
  const syncLikes = useAction(api.youtube.syncLikes);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const sync = async (syncType: "likes" | "history") => {
    setIsLoading(true);
    setShowOptions(false);
    try {
      await syncLikes({ syncType });
      const message = syncType === "likes" 
        ? "YouTube likes synced successfully!" 
        : "YouTube history synced successfully!";
      toast.success(message);
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError
          ? error.data
          : "An unexpected error occurred";
      toast.error(errorMessage);
    }

    setIsLoading(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isLoading}
        className={`p-2 rounded-lg transition-all duration-200 hover:bg-slate-300 dark:hover:bg-slate-600 group ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        title="Sync YouTube Data"
      >
        <svg 
          className={`w-5 h-5 cursor-pointer group-hover:rotate-180 transition-transform duration-300 ${isLoading ? "animate-spin" : ""}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {showOptions && !isLoading && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 z-50 min-w-64">
          <div className="p-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Choose sync method:
            </h3>
            <button
              onClick={() => void sync("likes")}
              className="w-full text-left p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mb-1"
            >
              <div className="font-medium text-slate-900 dark:text-slate-100">
                Search Liked videos only
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Only looks through videos you've liked on YouTube
              </div>
            </button>
            <button
              onClick={() => void sync("history")}
              className="w-full text-left p-3 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="font-medium text-slate-900 dark:text-slate-100">
                Search my entire YouTube history
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Looks through your full YouTube activity history
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close options when clicking outside */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
