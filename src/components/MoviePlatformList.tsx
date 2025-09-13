interface StreamingPlatform {
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface MoviePlatformListProps {
  platforms: StreamingPlatform[];
  isExpanded?: boolean;
}

export function MoviePlatformList({
  platforms,
  isExpanded = false,
}: MoviePlatformListProps) {
  if (!platforms || platforms.length === 0) {
    return null;
  }

  const maxPlatforms = isExpanded ? 10 : 3;
  const sortedPlatforms = platforms
    .sort((a, b) => a.display_priority - b.display_priority)
    .slice(0, maxPlatforms);

  return (
    <div className={`mt-2 ${isExpanded ? "mb-2" : "mb-1"}`}>
      <div className="flex flex-wrap gap-1">
        {sortedPlatforms.map((platform) => (
          <span
            key={platform.provider_id}
            className={`px-2 py-1 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-full ${
              isExpanded ? "text-xs" : "text-xs"
            } font-medium`}
          >
            {platform.provider_name}
          </span>
        ))}
        {!isExpanded && platforms.length > maxPlatforms && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            +{platforms.length - maxPlatforms} more
          </span>
        )}
      </div>
    </div>
  );
}
