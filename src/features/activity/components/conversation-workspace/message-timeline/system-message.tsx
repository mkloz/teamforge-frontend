import {
  BadgeCheck,
  CalendarPlus,
  CircleAlert,
  CircleX,
  Clock3,
  Info,
  MapPin,
  RefreshCcw,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { getSystemMessageConfig } from "@/features/activity/lib/chat-utils";
import { cn } from "@/shared/lib/utils";

interface SystemMessageProps {
  message: UnifiedMessage;
  isHighlighted?: boolean;
}

/**
 * SystemMessage - Renders a system message as a compact status note.
 * Optimized for readability and consistent branding across themes.
 */
export function SystemMessage({
  message,
  isHighlighted = false,
}: SystemMessageProps) {
  const config = getSystemMessageConfig(message.content);

  const styleMap = {
    error: {
      container: "border-destructive/25 bg-destructive/8 text-destructive",
      iconStroke: 2.5,
    },
    info: {
      container: "border-primary/20 bg-primary/5 text-primary",
      iconStroke: 2.5,
    },
    success: {
      container: "border-primary/25 bg-primary/8 text-primary",
      iconStroke: 3,
    },
    warning: {
      container: "border-accent/30 bg-accent/12 text-accent",
      iconStroke: 2.5,
    },
  } as const;
  const iconMap = {
    cancelled: CircleX,
    confirmed: BadgeCheck,
    declined: CircleX,
    default: Info,
    details: CalendarPlus,
    invite: UserRoundPlus,
    location: MapPin,
    member: UsersRound,
    rescheduled: RefreshCcw,
    time: Clock3,
  } as const;

  const { container, iconStroke } = styleMap[config.tone];
  const Icon = iconMap[config.kind] ?? CircleAlert;

  return (
    <div className="pointer-events-none my-0.5 flex justify-center px-6">
      <div
        className={cn(
          "max-w-full rounded-full border px-2.5 py-1 font-bold text-micro leading-snug tracking-tight sm:max-w-lg md:max-w-xl",
          container,
          isHighlighted && "message-search-focus",
        )}
      >
        <span className="inline-flex size-4 items-center justify-center align-middle">
          <Icon
            strokeWidth={iconStroke}
            className="size-2.5 opacity-80"
            aria-hidden="true"
          />
        </span>{" "}
        {message.content}
      </div>
    </div>
  );
}
