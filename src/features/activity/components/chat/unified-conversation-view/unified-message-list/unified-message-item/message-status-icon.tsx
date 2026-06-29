import {
  Check,
  CheckCheck,
  Clock,
  type LucideIcon,
  OctagonAlert,
} from "lucide-react";
import type { MessageStatus } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

interface MessageStatusIconProps {
  status?: MessageStatus;
  isOwn?: boolean;
  isReadByOthers?: boolean;
  className?: string;
}

interface MessageStatusIconState {
  Icon: LucideIcon;
  className: string;
  strokeWidth?: number;
}

interface MessageStatusIconConfig {
  Icon: MessageStatusIconState["Icon"];
  className?: string;
  strokeWidth?: number;
}

const MESSAGE_STATUS_LABELS = {
  DELIVERED: "Delivered",
  FAILED: "Not sent",
  READ: "Read",
  SENDING: "Sending",
  SENT: "Sent",
} as const satisfies Record<MessageStatus, string>;

const MESSAGE_STATUS_ICON_CONFIG: Record<
  MessageStatus,
  MessageStatusIconConfig
> = {
  DELIVERED: {
    Icon: CheckCheck,
    className: "text-slate-muted/40",
    strokeWidth: 2.5,
  },
  FAILED: {
    Icon: OctagonAlert,
    className: "text-destructive/80",
  },
  READ: {
    Icon: CheckCheck,
    strokeWidth: 2.5,
  },
  SENDING: {
    Icon: Clock,
    className: "animate-pulse text-slate-muted/40 motion-reduce:animate-none",
  },
  SENT: {
    Icon: Check,
    className: "text-slate-muted/40",
    strokeWidth: 3,
  },
};

export function MessageStatusIcon({
  status,
  isOwn,
  isReadByOthers,
  className,
}: MessageStatusIconProps) {
  if (!isOwn) return null;
  if (!status) return null;

  const label = getMessageStatusLabel(status, isReadByOthers);
  const iconState = getMessageStatusIconState(status, isReadByOthers);
  const Icon = iconState.Icon;

  return (
    <span className={cn("flex items-center", className)} title={label}>
      <span className="sr-only">{label}</span>
      <Icon
        aria-hidden="true"
        size={10}
        className={iconState.className}
        strokeWidth={iconState.strokeWidth}
      />
    </span>
  );
}

function getMessageStatusLabel(
  status: MessageStatus,
  isReadByOthers?: boolean,
) {
  if (status === "READ") return isReadByOthers ? "Read" : "Delivered";

  return MESSAGE_STATUS_LABELS[status];
}

function getMessageStatusIconState(
  status: MessageStatus,
  isReadByOthers?: boolean,
): MessageStatusIconState {
  const config = MESSAGE_STATUS_ICON_CONFIG[status];

  return {
    Icon: config.Icon,
    className: getMessageStatusIconClassName(status, isReadByOthers),
    strokeWidth: config.strokeWidth,
  };
}

function getMessageStatusIconClassName(
  status: MessageStatus,
  isReadByOthers?: boolean,
) {
  if (status === "READ") {
    return isReadByOthers ? "text-primary" : "text-slate-muted/40";
  }

  return MESSAGE_STATUS_ICON_CONFIG[status].className ?? "";
}
