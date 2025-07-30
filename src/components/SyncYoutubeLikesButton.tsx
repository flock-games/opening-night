import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";

export function SyncYoutubeLikesButton() {
  const syncLikes = useAction(api.youtube.syncLikes);

  const sync = async () => {
    await syncLikes({});
  };

  return (
    <div>
      <FontAwesomeIcon
        onClick={() => sync()}
        className="cursor-pointer hover:rotate-180 transition-transform duration-300"
        size="xl"
        icon={byPrefixAndName.faslr["arrows-rotate"]}
      />
    </div>
  );
}
