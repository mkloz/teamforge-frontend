import {
  getPresenceText,
  getProjectedPresenceText,
} from "@/shared/lib/presence-formatters";
import { cn } from "@/shared/lib/utils";
import type { OnlineStatus } from "@/shared/schemas/enums";

const PRESENCE_TONES: Record<OnlineStatus, string> = {
  AWAY: "text-spark-amber",
  OFFLINE: "text-muted-foreground/65",
  ONLINE: "text-forge-teal",
};

const PRESENCE_DOTS: Record<OnlineStatus, string> = {
  AWAY: "bg-spark-amber",
  OFFLINE: "bg-muted-foreground/45",
  ONLINE: "bg-forge-teal",
};

export function PresenceLabel({
  className,
  lastSeenAt,
  presenceLabel,
  status,
}: {
  className?: string;
  lastSeenAt?: string | null;
  presenceLabel?:
    | "HIDDEN"
    | "LONG_AGO"
    | "ONLINE"
    | "RECENTLY"
    | "THIS_WEEK"
    | "TODAY";
  status?: OnlineStatus;
}) {
  if (!status && !presenceLabel) {
    return null;
  }

  const label =
    getProjectedPresenceText(presenceLabel) ??
    getPresenceText(status ?? "OFFLINE", lastSeenAt);
  const toneStatus =
    presenceLabel === "ONLINE" ? "ONLINE" : (status ?? "OFFLINE");

  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-1 font-medium text-[0.6875rem] leading-none",
        PRESENCE_TONES[toneStatus],
        className,
      )}
      title={label}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", PRESENCE_DOTS[toneStatus])}
      />
      <span className="truncate">{label}</span>
    </span>
  );
}
