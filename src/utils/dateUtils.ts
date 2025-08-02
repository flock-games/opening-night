/**
 * Formats a date string (YYYY-MM-DD) to a localized date string
 * without timezone conversion issues.
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "August 6, 2025")
 */
export function formatReleaseDate(dateString: string): string {
  // Parse the date string manually to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
