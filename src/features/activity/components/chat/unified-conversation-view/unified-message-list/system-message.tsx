import { CircleCheck, Info, UserPlus } from "lucide-react";
import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { getSystemMessageConfig } from "@/features/activity/lib/chat-utils";
import { cn } from "@/shared/lib/utils";

interface SystemMessageProps {
  message: UnifiedMessage;
}

/**
 * SystemMessage - Renders a system message as a compact status pill.
 * Optimized for readability and consistent branding across themes.
 */
export const SystemMessage = memo(function SystemMessage({
  message,
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
    <div className="zoom-in-95 fade-in pointer-events-none mt-4 mb-2 flex animate-in justify-center px-6 duration-700">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1 font-bold text-micro tracking-tight",
          container,
        )}
      >
        <Icon
          size={11}
          strokeWidth={iconStroke}
          className="shrink-0 opacity-80"
        />
        <span>{message.content}</span>
      </div>
    </div>
  );
});
