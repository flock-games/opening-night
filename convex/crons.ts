import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at noon UTC to check for movie releases
crons.daily(
  "send daily release notifications",
  { hourUTC: 12, minuteUTC: 0 },
  internal.emails.sendDailyReleaseNotifications,
);

export default crons;
