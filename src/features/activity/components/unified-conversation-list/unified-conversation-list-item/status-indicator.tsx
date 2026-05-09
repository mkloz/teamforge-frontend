import { memo } from "react";

import { cn } from "@/shared/lib/utils";

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
          "absolute right-0 bottom-0 rounded-full border-2 border-background shadow-sm",
          isCompact ? "size-2.5" : "size-3.5",
          colors[status],
        )}
      />
    );
  },
);
