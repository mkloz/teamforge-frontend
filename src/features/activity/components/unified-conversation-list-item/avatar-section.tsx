import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import type { UnifiedConversation } from "../../types/unified-conversation.types";
import { StatusIndicator } from "./status-indicator";

export const AvatarSection = memo(
  ({ item, isGroup }: { item: UnifiedConversation; isGroup: boolean }) => (
    <div className="relative shrink-0">
      <div
        className={cn(
          "relative",
          isGroup ? "rounded-xl" : "rounded-full",
          "overflow-hidden ring-1 ring-border/50 group-hover/item:ring-forge-teal/30 transition-colors duration-200 shadow-sm",
        )}
      >
        <img
          src={item.avatarUrl || undefined}
          alt={item.title}
          className="w-12 h-12 object-cover bg-muted"
        />
      </div>

      {isGroup && item.secondaryAvatar && (
        <div className="absolute -bottom-1 -right-1 ring-2 ring-background rounded-lg overflow-hidden shadow-sm">
          <img
            src={item.secondaryAvatar}
            alt=""
            className="w-5.5 h-5.5 object-cover"
          />
        </div>
      )}

      {!isGroup && item.onlineStatus && (
        <StatusIndicator status={item.onlineStatus} />
      )}
    </div>
  ),
);
