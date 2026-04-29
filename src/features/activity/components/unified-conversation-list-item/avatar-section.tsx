import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import type { UnifiedConversation } from "../../lib/activity-contract";
import {
  getConversationAvatarUrl,
  getConversationOnlineStatus,
  getConversationSecondaryAvatar,
  getConversationTitle,
} from "../../lib/unify-conversations";
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
  }) => {
    const avatarUrl = getConversationAvatarUrl(item);
    const title = getConversationTitle(item);
    const secondaryAvatar = getConversationSecondaryAvatar(item);
    const onlineStatus = getConversationOnlineStatus(item);

    return (
      <div className="relative shrink-0">
        <div
          className={cn(
            "relative",
            isGroup ? "rounded-md" : "rounded-full",
            "overflow-hidden ring-1 ring-border/50 group-hover/item:ring-forge-teal/30 transition-colors duration-200 shadow-sm",
          )}
        >
          <img
            src={avatarUrl || undefined}
            alt={title}
            className={cn(
              "object-cover bg-muted",
              isCompact ? "w-9 h-9" : "w-11 h-11",
            )}
          />
        </div>

        {isGroup && secondaryAvatar && !isCompact && (
          <div className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background rounded-lg overflow-hidden shadow-sm">
            <img
              src={secondaryAvatar}
              alt=""
              className="w-3 h-3 object-cover"
            />
          </div>
        )}

        {!isGroup && onlineStatus && (
          <StatusIndicator status={onlineStatus} isCompact={isCompact} />
        )}
      </div>
    );
  },
);
