import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import type { UnifiedConversation } from "../../types/unified-conversation.types";
import { StatusIndicator } from "./status-indicator";

export const AvatarSection = memo(
  ({
    item,
    isGroup,
    isCompact = false,
  }: {
    item: UnifiedConversation;
    isGroup: boolean;
    isCompact?: boolean;
  }) => (
    <div className="relative shrink-0">
      <div
        className={cn(
          "relative",
          isGroup ? "rounded-md" : "rounded-full",
          "overflow-hidden ring-1 ring-border/50 group-hover/item:ring-forge-teal/30 transition-colors duration-200 shadow-sm",
        )}
      >
        <img
          src={item.avatarUrl || undefined}
          alt={item.title}
          className={cn(
            "object-cover bg-muted",
            isCompact ? "w-9 h-9" : "w-11 h-11",
          )}
        />
      </div>

      {isGroup && item.secondaryAvatar && !isCompact && (
        <div className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background rounded-lg overflow-hidden shadow-sm">
          <img
            src={item.secondaryAvatar}
            alt=""
            className="w-3 h-3 object-cover"
          />
        </div>
      )}

      {!isGroup && item.onlineStatus && (
        <StatusIndicator status={item.onlineStatus} isCompact={isCompact} />
      )}
    </div>
  ),
);
