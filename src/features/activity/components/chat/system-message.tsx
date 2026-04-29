import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { cn } from "@/shared/lib/utils";
import { Info, Sparkles, UserPlus } from "lucide-react";
import { memo, useMemo } from "react";
import { getSystemMessageConfig } from "../../lib/chat-utils";

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
  const config = useMemo(
    () => getSystemMessageConfig(message.content),
    [message.content],
  );

  const styleMap = {
    positive: {
      container:
        "bg-forge-teal/5 border-forge-teal/15 text-forge-teal/90 shadow-sm",
      icon: Sparkles,
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
    <div className="flex justify-center px-6 mt-4 mb-2 animate-in fade-in zoom-in-95 duration-700 pointer-events-none">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full border text-micro font-bold tracking-tight ",
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
