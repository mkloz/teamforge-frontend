import { cn } from "@/shared/lib/utils";
import { Check, CheckCheck, Clock, OctagonAlert } from "lucide-react";
import { memo } from "react";
import type { MessageStatus } from "../../lib/activity-contract";

interface MessageStatusIconProps {
  status?: MessageStatus;
  isOwn?: boolean;
  isReadByOthers?: boolean;
  className?: string;
}

export const MessageStatusIcon = memo(function MessageStatusIcon({
  status,
  isOwn,
  isReadByOthers,
  className,
}: MessageStatusIconProps) {
  if (!isOwn) return null;

  return (
    <div className={cn("flex items-center", className)}>
      {status === "SENDING" && (
        <Clock size={10} className="text-slate-muted/40 animate-pulse" />
      )}
      {status === "SENT" && (
        <Check size={10} className="text-slate-muted/40" strokeWidth={3} />
      )}
      {status === "DELIVERED" && (
        <CheckCheck
          size={10}
          className="text-slate-muted/40"
          strokeWidth={2.5}
        />
      )}
      {status === "READ" && (
        <CheckCheck
          size={10}
          className={cn(
            isReadByOthers ? "text-forge-teal" : "text-slate-muted/40",
          )}
          strokeWidth={2.5}
        />
      )}
      {status === "FAILED" && (
        <OctagonAlert size={10} className="text-destructive/80" />
      )}
    </div>
  );
});
