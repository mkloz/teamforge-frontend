export function RecentActivitySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse overflow-hidden rounded-lg border border-border/30 bg-card"
        >
          <div className="flex h-full items-center gap-2.5">
            <div className="h-full w-14 bg-muted" />
            <div className="min-w-0 flex-1 space-y-1.5 pr-3">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-2.5 w-1/2 rounded bg-muted/70" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
