export function Spinner({ className = '' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="w-8 h-8 text-indigo-500" />
        <p className="text-sm text-mute">Loading...</p>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-100 dark:bg-dark-surface rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-dark-card rounded-xl p-6 card-shadow space-y-4">
          <div className="h-4 bg-gray-100 dark:bg-dark-surface rounded animate-pulse w-1/3" />
          <div className="h-8 bg-gray-100 dark:bg-dark-surface rounded animate-pulse w-1/2" />
          <div className="h-3 bg-gray-100 dark:bg-dark-surface rounded animate-pulse w-2/3" />
        </div>
      ))}
    </div>
  );
}
