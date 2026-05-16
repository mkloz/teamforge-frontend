import { CircleCheck, Info, UserPlus } from "lucide-react";
import { memo } from "react";
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
export const SystemMessage = memo(function SystemMessage({
  message,
  isHighlighted = false,
}: SystemMessageProps) {
  const config = getSystemMessageConfig(message.content);

  const styleMap = {
    positive: {
      container:
        "bg-forge-teal/5 border-forge-teal/15 text-forge-teal/90 shadow-sm",
      icon: CircleCheck,
      iconStroke: 3,
    },
    "user-event": {
      container: "bg-slate-muted/5 border-slate-muted/10 text-slate-muted",
      icon: UserPlus,
      iconStroke: 2.5,
    },
    info: {
      container: "bg-slate-muted/5 border-slate-muted/10 text-slate-muted",
      icon: Info,
      iconStroke: 2.5,
    },
  } as const;

  const { container, icon: Icon, iconStroke } = styleMap[config.type];

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
});
