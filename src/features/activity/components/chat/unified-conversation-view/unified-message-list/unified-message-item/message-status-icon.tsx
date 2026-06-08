import { Check, CheckCheck, Clock, OctagonAlert } from "lucide-react";
import { memo } from "react";
import type { MessageStatus } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

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
  if (!status) return null;

  const label = getMessageStatusLabel(status, isReadByOthers);

  return (
    <div
      aria-label={label}
      className={cn("flex items-center", className)}
      role="img"
      title={label}
    >
      {status === "SENDING" && (
        <Clock
          size={10}
          className="animate-pulse text-slate-muted/40 motion-reduce:animate-none"
        />
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
            isReadByOthers ? "text-primary" : "text-slate-muted/40",
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

function getMessageStatusLabel(
  status: MessageStatus,
  isReadByOthers?: boolean,
) {
  if (status === "SENDING") return "Sending";
  if (status === "SENT") return "Sent";
  if (status === "DELIVERED") return "Delivered";
  if (status === "READ") return isReadByOthers ? "Read" : "Delivered";
  return "Not sent";
}
