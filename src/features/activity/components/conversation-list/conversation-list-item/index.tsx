import {
  Bell,
  BellOff,
  CheckCheck,
  MessageCircle,
  Pin,
  PinOff,
} from "lucide-react";
import { ActivityMenuIcon } from "@/features/activity/components/activity-menu-icon";
import {
  ACTIVITY_MENU_ITEM_CLASS,
  ACTIVITY_MENU_SEPARATOR_CLASS,
  getActivityMenuContentClass,
} from "@/features/activity/components/activity-popup-styles";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import {
  getConversationIsMuted,
  getConversationTitle,
} from "@/features/activity/lib/unify-conversations";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { cn } from "@/shared/lib/utils";
import { AvatarSection } from "./avatar-section";
import { ContentSection } from "./content-section";

interface ConversationListItemProps {
  item: UnifiedConversation;
  isSelected: boolean;
  isSavedView?: boolean;
  density?: "default" | "compact";
  onSelect: () => void;
  onTogglePinned: () => void;
  onToggleMuted: () => void;
  onMarkRead: () => void;
}

/**
 * ConversationListItem - Renders a single conversation in the sidebar list.
 */
export function ConversationListItem({
  item,
  isSelected,
  isSavedView = false,
  density = "default",
  onSelect,
  onTogglePinned,
  onToggleMuted,
  onMarkRead,
}: ConversationListItemProps) {
  const viewState = getConversationListItemViewState({
    density,
    isSelected,
    item,
  });

  return (
    <ContextMenu modal={false}>
      <ConversationListItemRow
        isSavedView={isSavedView}
        item={item}
        onSelect={onSelect}
        onTogglePinned={onTogglePinned}
        viewState={viewState}
      />
      <ConversationListItemActions
        item={item}
        isMuted={viewState.isMuted}
        onMarkRead={onMarkRead}
        onSelect={onSelect}
        onToggleMuted={onToggleMuted}
        onTogglePinned={onTogglePinned}
      />
    </ContextMenu>
  );
}

interface ConversationListItemViewState {
  isCompact: boolean;
  isGroup: boolean;
  isMuted: boolean;
  isSelected: boolean;
  optionLabel: string;
  rowClassName: string;
  selectedIndicatorClassName: string;
}

function getConversationListItemViewState({
  density,
  isSelected,
  item,
}: {
  density: ConversationListItemProps["density"];
  isSelected: boolean;
  item: UnifiedConversation;
}): ConversationListItemViewState {
  const isCompact = density === "compact";
  const isMuted = getConversationIsMuted(item);

  return {
    isCompact,
    isGroup: item.kind === "group",
    isMuted,
    isSelected,
    optionLabel: getConversationOptionLabel(item, isMuted),
    rowClassName: cn(
      "activity-list-row-containment group/item relative flex w-full cursor-pointer select-none items-center text-left outline-none transition duration-200",
      isCompact ? "gap-2.5 px-3 py-1" : "gap-3.5 px-4 py-2",
      isSelected ? "bg-muted/60" : "hover:bg-muted/30",
    ),
    selectedIndicatorClassName: cn(
      "pointer-events-none absolute top-0 left-0 z-20 h-full w-1 bg-brand-teal opacity-0 transition-opacity duration-300",
      isSelected ? "opacity-100" : "group-hover/item:opacity-40",
    ),
  };
}

function ConversationListItemRow({
  isSavedView,
  item,
  onSelect,
  onTogglePinned,
  viewState,
}: {
  isSavedView: boolean;
  item: UnifiedConversation;
  onSelect: () => void;
  onTogglePinned: () => void;
  viewState: ConversationListItemViewState;
}) {
  return (
    <div className={viewState.rowClassName}>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          aria-current={viewState.isSelected ? "true" : undefined}
          aria-label={viewState.optionLabel}
          className="absolute inset-0 z-10 cursor-pointer appearance-none rounded-none border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-inset"
          onClick={onSelect}
        >
          <span className="sr-only">{viewState.optionLabel}</span>
        </button>
      </ContextMenuTrigger>
      <span
        aria-hidden="true"
        className={viewState.selectedIndicatorClassName}
      />
      <AvatarSection
        item={item}
        isGroup={viewState.isGroup}
        isCompact={viewState.isCompact}
      />
      <ContentSection
        item={item}
        density={viewState.isCompact ? "compact" : "default"}
        selection={viewState.isSelected ? "selected" : "idle"}
        source={isSavedView ? "saved" : "conversation"}
        onTogglePinned={onTogglePinned}
      />
    </div>
  );
}

function ConversationListItemActions({
  item,
  isMuted,
  onMarkRead,
  onSelect,
  onToggleMuted,
  onTogglePinned,
}: {
  item: UnifiedConversation;
  isMuted: boolean;
  onMarkRead: () => void;
  onSelect: () => void;
  onToggleMuted: () => void;
  onTogglePinned: () => void;
}) {
  return (
    <ContextMenuContent
      aria-label="Conversation actions"
      className={getActivityMenuContentClass("w-48")}
    >
      <ContextMenuItem className={ACTIVITY_MENU_ITEM_CLASS} onSelect={onSelect}>
        <ActivityMenuIcon>
          <MessageCircle className="size-4" />
        </ActivityMenuIcon>
        <span className="min-w-0 flex-1 truncate">Open chat</span>
      </ContextMenuItem>
      <ContextMenuSeparator className={ACTIVITY_MENU_SEPARATOR_CLASS} />
      <PinConversationMenuItem item={item} onTogglePinned={onTogglePinned} />
      <MuteConversationMenuItem
        isMuted={isMuted}
        onToggleMuted={onToggleMuted}
      />
      <MarkReadConversationMenuItem
        unreadCount={item.unreadCount}
        onMarkRead={onMarkRead}
      />
    </ContextMenuContent>
  );
}

function PinConversationMenuItem({
  item,
  onTogglePinned,
}: {
  item: UnifiedConversation;
  onTogglePinned: () => void;
}) {
  return (
    <ContextMenuItem
      className={cn(
        ACTIVITY_MENU_ITEM_CLASS,
        item.isPinned && "text-foreground",
      )}
      onSelect={onTogglePinned}
    >
      <ActivityMenuIcon tone={item.isPinned ? "active" : "default"}>
        {item.isPinned ? (
          <PinOff className="size-4" />
        ) : (
          <Pin className="size-4" />
        )}
      </ActivityMenuIcon>
      <span className="min-w-0 flex-1 truncate">
        {item.isPinned ? "Unpin chat" : "Pin chat"}
      </span>
    </ContextMenuItem>
  );
}

function MuteConversationMenuItem({
  isMuted,
  onToggleMuted,
}: {
  isMuted: boolean;
  onToggleMuted: () => void;
}) {
  return (
    <ContextMenuItem
      className={cn(ACTIVITY_MENU_ITEM_CLASS, isMuted && "text-foreground")}
      onSelect={onToggleMuted}
    >
      <ActivityMenuIcon tone={isMuted ? "active" : "default"}>
        {isMuted ? <Bell className="size-4" /> : <BellOff className="size-4" />}
      </ActivityMenuIcon>
      <span className="min-w-0 flex-1 truncate">
        {isMuted ? "Unmute chat" : "Mute chat"}
      </span>
    </ContextMenuItem>
  );
}

function MarkReadConversationMenuItem({
  onMarkRead,
  unreadCount,
}: {
  onMarkRead: () => void;
  unreadCount: number;
}) {
  if (unreadCount <= 0) {
    return null;
  }

  return (
    <ContextMenuItem className={ACTIVITY_MENU_ITEM_CLASS} onSelect={onMarkRead}>
      <ActivityMenuIcon>
        <CheckCheck className="size-4" />
      </ActivityMenuIcon>
      <span className="min-w-0 flex-1 truncate">Mark as read</span>
    </ContextMenuItem>
  );
}

function getConversationOptionLabel(
  item: UnifiedConversation,
  isMuted: boolean,
) {
  const parts = [getConversationTitle(item)];

  if (item.unreadCount > 0) {
    parts.push(`${item.unreadCount} unread`);
  }

  if (item.isPinned) {
    parts.push("pinned");
  }

  if (isMuted) {
    parts.push("muted");
  }

  return parts.join(", ");
}
