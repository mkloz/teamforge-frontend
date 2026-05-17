import { NotebookPen } from "lucide-react";
import { memo } from "react";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import {
  getConversationAvatarUrl,
  getConversationIsNotes,
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
    const isNotes = getConversationIsNotes(item);
    const avatarSizeClassName = isCompact ? "size-9" : "size-11";

    return (
      <div className="relative shrink-0">
        {isNotes ? (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full border border-forge-teal/20 bg-forge-teal/10 text-forge-teal shadow-sm ring-1 ring-border/40 transition-colors duration-200 group-hover/item:ring-forge-teal/30",
              avatarSizeClassName,
            )}
            aria-hidden="true"
          >
            <NotebookPen className="size-4" strokeWidth={2.25} />
          </span>
        ) : (
          <Avatar
            src={avatarUrl}
            name={title}
            shape={isGroup ? "rounded" : "circle"}
            className={cn(
              "shadow-sm ring-1 ring-border/50 transition-colors duration-200 group-hover/item:ring-forge-teal/30",
              isGroup && "rounded-md",
              avatarSizeClassName,
            )}
          />
        )}

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
