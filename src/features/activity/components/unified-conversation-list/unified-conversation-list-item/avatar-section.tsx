import { memo } from "react";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import {
  getConversationAvatarUrl,
  getConversationOnlineStatus,
  getConversationSecondaryAvatar,
  getConversationTitle,
} from "@/features/activity/lib/unify-conversations";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
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
    const onlineStatus = getConversationOnlineStatus(item);
    const secondaryAvatar = getConversationSecondaryAvatar(item);

    return (
      <div className="relative shrink-0">
        <Avatar
          src={avatarUrl}
          name={title}
          shape={isGroup ? "rounded" : "circle"}
          className={cn(
            "shadow-sm ring-1 ring-border/50 transition-colors duration-200 group-hover/item:ring-forge-teal/30",
            isGroup && "rounded-md",
            isCompact ? "size-10 md:size-9" : "size-11",
          )}
        />

        {!isGroup && onlineStatus && (
          <StatusIndicator status={onlineStatus} isCompact={isCompact} />
        )}

        {isGroup && secondaryAvatar ? (
          <div className="absolute -right-0.5 -bottom-0.5 z-10 size-3 overflow-hidden rounded-lg shadow-sm">
            <Avatar
              src={secondaryAvatar}
              alt=""
              fallback=""
              shape="rounded"
              className="size-full rounded-lg"
            />
          </div>
        ) : null}
      </div>
    );
  },
);
