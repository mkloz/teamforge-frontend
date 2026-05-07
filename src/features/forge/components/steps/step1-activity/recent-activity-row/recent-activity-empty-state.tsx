import { Clock3 } from "lucide-react";

export function RecentActivityEmptyState() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/40 bg-card/70 px-3.5 py-3 text-muted-foreground">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Clock3 size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-sm leading-tight font-semibold text-foreground">
          No recent activity yet
        </p>
        <p className="text-xs leading-snug text-muted-foreground">
          Your previous forge choices will appear here.
        </p>
      </div>
    </div>
  );
}
