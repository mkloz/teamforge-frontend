import { History } from "lucide-react";
import { IconTile } from "@/shared/components/ui/icon-tile";

export function RecentActivityEmptyState() {
  return (
    <div className="flex min-h-24 items-center justify-center gap-3 rounded-lg border border-border/40 border-dashed bg-card/70 px-3.5 py-3 text-muted-foreground">
      <IconTile icon={History} size="lg" shape="circle" tone="neutral" />
      <p className="min-w-0 font-semibold text-foreground text-sm leading-tight">
        No recent activity yet
      </p>
    </div>
  );
}
