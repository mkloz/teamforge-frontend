import { Clock3 } from "lucide-react";

export function RecentActivityEmptyState() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/40 border-dashed bg-card/70 px-3.5 py-3 text-muted-foreground">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Clock3 size={15} />
      </div>
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
