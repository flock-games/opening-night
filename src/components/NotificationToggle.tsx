import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-2f975920ad/icons";
import { useState } from "react";
import { toast } from "react-toastify";

export function NotificationToggle() {
  const notificationSettings = useQuery(api.emails.getUserNotificationSettings);
  const toggleNotifications = useMutation(api.emails.toggleNotifications);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const newEnabledState = !notificationSettings?.enabled;
      await toggleNotifications({ enabled: newEnabledState });
      toast.success(
        newEnabledState
          ? "You will receive an email when movies on your Coming Soon list are released!"
          : "You will no longer receive emails for new releases.",
      );
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isEnabled = notificationSettings?.enabled ?? false;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-all duration-200 hover:bg-slate-300 dark:hover:bg-slate-600 group ${
        isEnabled
          ? "text-green-400 hover:text-rose-400"
          : "text-rose-400 hover:text-green-400"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={`${isEnabled ? "Disable" : "Enable"} release email notifications`}
    >
      <FontAwesomeIcon
        icon={byPrefixAndName.faslr["bell"]}
        size="lg"
        className={`transition-transform duration-300 group-hover:rotate-45 ${isLoading ? "animate-pulse" : ""}`}
      />
    </button>
  );
}
