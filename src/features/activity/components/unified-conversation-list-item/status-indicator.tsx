import { cn } from "@/shared/lib/utils";
import { memo } from "react";
export const StatusIndicator = memo(
  ({
    status,
    isCompact = false,
  }: {
    status: "ONLINE" | "AWAY" | "OFFLINE";
    isCompact?: boolean;
  }) => {
    const colors = {
      ONLINE: "bg-forge-teal",
      AWAY: "bg-spark-amber",
      OFFLINE: "bg-slate-muted/40",
    };

    return (
      <span
        className={cn(
          "absolute bottom-0 right-0 rounded-full border-2 border-background shadow-sm",
          isCompact ? "w-2.5 h-2.5" : "w-3.5 h-3.5",
          colors[status],
        )}
      />
    );
  },
);
