import { EmptyRecentActivityVisual } from "@/features/forge/assets/empty-recent-activity";

export function RecentActivityEmptyState() {
  return (
    <div className="flex min-h-24 items-center justify-center gap-3 rounded-lg border border-border/40 border-dashed bg-card/70 px-3.5 py-3 text-muted-foreground">
      <EmptyRecentActivityVisual className="h-9 w-auto shrink-0 text-foreground sm:h-10" />
      <p className="min-w-0 font-semibold text-foreground text-sm leading-tight">
        No recent activity yet
      </p>
    </div>
  );
}
