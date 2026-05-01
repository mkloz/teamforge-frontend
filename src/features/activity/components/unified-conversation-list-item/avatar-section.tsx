import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import { memo } from "react";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import {
  getConversationAvatarUrl,
  getConversationOnlineStatus,
  getConversationSecondaryAvatar,
  getConversationTitle,
} from "@/features/activity/lib/unify-conversations";
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
        <Avatar
          src={avatarUrl}
          name={title}
          shape={isGroup ? "rounded" : "circle"}
          className={cn(
            "ring-1 ring-border/50 shadow-sm transition-colors duration-200 group-hover/item:ring-forge-teal/30",
            isGroup && "rounded-md",
            isCompact ? "w-9 h-9" : "w-11 h-11",
          )}
        />

        {isGroup && secondaryAvatar && !isCompact && (
          <div className="absolute -bottom-0.5 -right-0.5 ring-2 ring-background rounded-lg overflow-hidden shadow-sm">
            <Avatar
              src={secondaryAvatar}
              alt=""
              shape="rounded"
              className="w-3 h-3 rounded-lg"
              fallback=""
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
