import { MyNotesAvatarVisual } from "@/features/activity/assets/special-conversation-avatars";
import { getPlanStatusConfig } from "@/features/activity/components/conversation-workspace/chat-status-bar/chat-status-plan-config";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import {
  getConversationAvatarUrl,
  getConversationIsNotes,
  getConversationOnlineStatus,
  getConversationTitle,
} from "@/features/activity/lib/unify-conversations";
import { Avatar } from "@/shared/components/common/avatar";
import { StatusPill } from "@/shared/components/ui/status-pill";
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

      <GroupPlanStatus item={item} isGroup={isGroup} />
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
        "shadow-sm ring-1 ring-border/50 transition-colors duration-200 group-hover/item:ring-brand-teal/30",
        isGroup && "rounded-md",
        viewState.avatarSizeClassName,
      )}
      fallbackClassName={cn(
        "font-black",
        isGroup && !viewState.isCompact && "text-sm",
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

function GroupPlanStatus({
  item,
  isGroup,
}: {
  item: UnifiedConversation;
  isGroup: boolean;
}) {
  const plan = item.kind === "group" ? item.group?.plan : null;

  if (!isGroup || !plan) {
    return null;
  }

  const config = getPlanStatusConfig(plan);

  return (
    <StatusPill
      icon={config.icon}
      iconClassName="size-2.5"
      iconStrokeWidth={2.2}
      tone="none"
      size="signature"
      surface="soft"
      className={cn(
        "pointer-events-none absolute -right-0.5 -bottom-0.5 z-20 size-4 min-w-0 p-0 shadow-sm ring-2 ring-canvas",
        config.badgeClass,
      )}
      title={`Plan ${config.label.toLowerCase()}`}
    >
      <span className="sr-only">Plan {config.label.toLowerCase()}</span>
    </StatusPill>
  );
}
