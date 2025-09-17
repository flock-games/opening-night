import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
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
      <svg 
        className={`w-5 h-5 transition-transform duration-300 group-hover:rotate-45 ${isLoading ? "animate-pulse" : ""}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5V2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19c0 1.1.9 2 2 2h8.586a1 1 0 00.707-.293l5.414-5.414A1 1 0 0021 14.586V9a2 2 0 00-2-2H7a2 2 0 00-2 2v10z" />
      </svg>
    </button>
  );
}
