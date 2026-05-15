import { EmptyRecentActivityVisual } from "@/assets/empty-state/empty-recent-activity";

export function RecentActivityEmptyState() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 border-dashed bg-card/70 px-3.5 py-3 text-muted-foreground">
      <EmptyRecentActivityVisual className="h-9 w-auto shrink-0 text-foreground sm:h-10" />
      <div className="min-w-0">
        <p className="font-semibold text-foreground text-sm leading-tight">
          No recent activity yet
        </p>
        <p className="text-muted-foreground text-xs leading-snug">
          Your previous forge choices will appear here.
        </p>
      </div>
    </div>
  );
}
