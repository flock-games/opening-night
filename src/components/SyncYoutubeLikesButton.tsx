import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";
import { useState } from "react";
import { ConvexError } from "convex/values";
import toast from "react-hot-toast";

export function SyncYoutubeLikesButton() {
  const syncLikes = useAction(api.youtube.syncLikes);
  const [isLoading, setIsLoading] = useState(false);

  const sync = async () => {
    setIsLoading(true);
    try {
      await syncLikes({});
      toast.success("YouTube likes synced successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? error.data : "An unexpected error occurred";
      toast.error(errorMessage);
    }

    setIsLoading(false);
  };

  return (
    <button
      onClick={sync}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-all duration-200 hover:bg-slate-300 dark:hover:bg-slate-600 group ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={`Sync YouTube Likes`}
    >
      <FontAwesomeIcon
        className="cursor-pointer group-hover:rotate-180 transition-transform duration-300"
        size="xl"
        icon={byPrefixAndName.faslr["arrows-rotate"]}
      />
    </button>
  );
}
