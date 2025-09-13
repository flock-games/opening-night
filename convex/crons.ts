import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily at noon UTC to check for movie releases
crons.daily(
  "send daily release notifications",
  { hourUTC: 12, minuteUTC: 0 },
  internal.emails.sendDailyReleaseNotifications,
);

// Run weekly on Sundays at midnight UTC to update movie release dates
crons.weekly(
  "update movie release dates",
  { dayOfWeek: "sunday", hourUTC: 0, minuteUTC: 0 },
  internal.movies.updateUnreleasedMoviesDates,
);

// Run weekly on Sundays at 1 AM UTC to update streaming platforms for released movies  
crons.weekly(
  "update streaming platforms",
  { dayOfWeek: "sunday", hourUTC: 1, minuteUTC: 0 },
  internal.movies.updateReleasedMoviesStreamingPlatforms,
);

export default crons;
