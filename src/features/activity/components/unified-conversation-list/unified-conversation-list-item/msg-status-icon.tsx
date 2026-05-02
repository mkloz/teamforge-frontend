import { Check, CheckCheck } from "lucide-react";
import { memo } from "react";
import { cn } from "@/shared/lib/utils";
import type { MessageStatus } from "@/features/activity/lib/activity-contract";

export const MsgStatusIcon = memo(
  ({
    status,
    isCompact = false,
  }: {
    status: MessageStatus;
    isCompact?: boolean;
  }) => {
    const size = isCompact ? 10 : 12;

    switch (status) {
      case "SENDING":
        return (
          <span
            className={cn(
              "rounded-full border border-slate-muted/40 border-t-transparent animate-spin",
              isCompact ? "w-2.5 h-2.5" : "w-3 h-3",
            )}
          />
        );
      case "SENT":
        return <Check size={size} className="text-slate-muted" />;
      case "DELIVERED":
        return <CheckCheck size={size} className="text-slate-muted" />;
      case "READ":
        return <CheckCheck size={size} className="text-forge-teal" />;
      default:
        return null;
    }
  },
);
