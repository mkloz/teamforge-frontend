import { Check, CheckCheck, type LucideIcon } from "lucide-react";
import type { MessageStatus } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";

interface MsgStatusIconConfig {
  Icon: LucideIcon;
  className: string;
}

const CHECK_ICON_CONFIG = {
  DELIVERED: {
    Icon: CheckCheck,
    className: "text-slate-muted",
  },
  FAILED: null,
  READ: {
    Icon: CheckCheck,
    className: "text-foreground",
  },
  SENT: {
    Icon: Check,
    className: "text-slate-muted",
  },
} as const satisfies Record<
  Exclude<MessageStatus, "SENDING">,
  MsgStatusIconConfig | null
>;

export function MsgStatusIcon({
  status,
  isCompact = false,
}: {
  status: MessageStatus;
  isCompact?: boolean;
}) {
  const size = isCompact ? 10 : 12;

  if (status === "SENDING") {
    return <SendingStatusIcon isCompact={isCompact} />;
  }

  const iconConfig = CHECK_ICON_CONFIG[status];

  if (!iconConfig) {
    return null;
  }

  const Icon = iconConfig.Icon;

  return <Icon size={size} className={iconConfig.className} />;
}

function SendingStatusIcon({ isCompact }: { isCompact: boolean }) {
  return (
    <span
      className={cn(
        "animate-spin rounded-full border border-slate-muted/40 border-t-transparent",
        isCompact ? "size-2.5" : "size-3",
      )}
    />
  );
}
