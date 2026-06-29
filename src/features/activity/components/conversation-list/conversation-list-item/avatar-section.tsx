import { MyNotesAvatarVisual } from "@/features/activity/assets/special-conversation-avatars";
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

export function AvatarSection({
  item,
  isGroup,
  isCompact = false,
}: {
  item: UnifiedConversation;
  isGroup: boolean;
  isCompact?: boolean;
}) {
  const viewState = getAvatarSectionViewState({ isCompact, item });

  return (
    <div className="relative shrink-0">
      <ConversationAvatar isGroup={isGroup} viewState={viewState} />

      <ConversationOnlineStatus isGroup={isGroup} viewState={viewState} />

      <SecondaryGroupAvatar isGroup={isGroup} viewState={viewState} />
    </div>
  );
}

interface AvatarSectionViewState {
  avatarImageSize: number;
  avatarSizeClassName: string;
  avatarUrl: string | null;
  isCompact: boolean;
  isNotes: boolean;
  onlineStatus: ReturnType<typeof getConversationOnlineStatus>;
  secondaryAvatar: string | null;
  title: string;
}

function getAvatarSectionViewState({
  isCompact,
  item,
}: {
  isCompact: boolean;
  item: UnifiedConversation;
}): AvatarSectionViewState {
  return {
    avatarImageSize: isCompact ? 48 : 64,
    avatarSizeClassName: isCompact ? "size-9" : "size-11",
    avatarUrl: getConversationAvatarUrl(item),
    isCompact,
    isNotes: getConversationIsNotes(item),
    onlineStatus: getConversationOnlineStatus(item),
    secondaryAvatar: getConversationSecondaryAvatar(item) ?? null,
    title: getConversationTitle(item),
  };
}

function ConversationAvatar({
  isGroup,
  viewState,
}: {
  isGroup: boolean;
  viewState: AvatarSectionViewState;
}) {
  if (viewState.isNotes) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-transparent text-foreground transition-colors duration-200",
          viewState.avatarSizeClassName,
        )}
        aria-hidden="true"
      >
        <MyNotesAvatarVisual className="size-full scale-110 overflow-visible" />
      </span>
    );
  }

  return (
    <Avatar
      src={viewState.avatarUrl}
      name={viewState.title}
      imageSize={viewState.avatarImageSize}
      shape={isGroup ? "rounded" : "circle"}
      className={cn(
        "shadow-sm ring-1 ring-border/50 transition-colors duration-200 group-hover/item:ring-forge-teal/30",
        isGroup && "rounded-md",
        viewState.avatarSizeClassName,
      )}
    />
  );
}

function ConversationOnlineStatus({
  isGroup,
  viewState,
}: {
  isGroup: boolean;
  viewState: AvatarSectionViewState;
}) {
  if (isGroup || !viewState.onlineStatus) {
    return null;
  }

  return (
    <StatusIndicator
      status={viewState.onlineStatus}
      isCompact={viewState.isCompact}
    />
  );
}

function SecondaryGroupAvatar({
  isGroup,
  viewState,
}: {
  isGroup: boolean;
  viewState: AvatarSectionViewState;
}) {
  if (!isGroup || !viewState.secondaryAvatar) {
    return null;
  }

  return (
    <div className="absolute -right-0.5 -bottom-0.5 z-10 size-3 overflow-hidden rounded-lg shadow-sm">
      <Avatar
        src={viewState.secondaryAvatar}
        alt=""
        fallback=""
        imageSize={32}
        shape="rounded"
        className="size-full rounded-lg"
      />
    </div>
  );
}
