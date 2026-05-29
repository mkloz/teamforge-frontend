import {
  Bell,
  BellOff,
  CheckCheck,
  MessageCircle,
  Pin,
  PinOff,
} from "lucide-react";
import { memo } from "react";
import {
  ACTIVITY_MENU_ICON_CLASS,
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

interface UnifiedConversationListItemProps {
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
 * UnifiedConversationListItem - Renders a single conversation in the sidebar list.
 */
export const UnifiedConversationListItem = memo(
  function UnifiedConversationListItem({
    item,
    isSelected,
    isSavedView = false,
    density = "default",
    onSelect,
    onTogglePinned,
    onToggleMuted,
    onMarkRead,
  }: UnifiedConversationListItemProps) {
    const isGroup = item.kind === "group";
    const isCompact = density === "compact";
    const isMuted = getConversationIsMuted(item);
    const optionLabel = getConversationOptionLabel(item, isMuted);

    return (
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "group/item relative flex w-full cursor-pointer select-none items-center text-left outline-none transition duration-200",
              isCompact ? "gap-2.5 px-3 py-1" : "gap-3.5 px-4 py-2",
              isSelected ? "bg-muted/60" : "hover:bg-muted/30",
            )}
          >
            <button
              type="button"
              aria-current={isSelected ? "true" : undefined}
              aria-label={optionLabel}
              className="absolute inset-0 z-10 cursor-pointer appearance-none rounded-none border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35 focus-visible:ring-inset"
              onClick={onSelect}
            >
              <span className="sr-only">{optionLabel}</span>
            </button>
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute top-0 left-0 z-20 h-full w-1 bg-forge-teal opacity-0 transition-opacity duration-300",
                isSelected ? "opacity-100" : "group-hover/item:opacity-40",
              )}
            />
            <AvatarSection
              item={item}
              isGroup={isGroup}
              isCompact={isCompact}
            />
            <ContentSection
              item={item}
              isGroup={isGroup}
              isSelected={isSelected}
              isCompact={isCompact}
              isSavedView={isSavedView}
              onTogglePinned={onTogglePinned}
            />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent
          aria-label="Conversation actions"
          className={getActivityMenuContentClass("w-48")}
        >
          <ContextMenuItem
            className={ACTIVITY_MENU_ITEM_CLASS}
            onSelect={onSelect}
          >
            <span className={ACTIVITY_MENU_ICON_CLASS}>
              <MessageCircle className="size-4" />
            </span>
            <span className="min-w-0 flex-1 truncate">Open chat</span>
          </ContextMenuItem>
          <ContextMenuSeparator className={ACTIVITY_MENU_SEPARATOR_CLASS} />
          <ContextMenuItem
            className={cn(
              ACTIVITY_MENU_ITEM_CLASS,
              item.isPinned && "text-forge-teal",
            )}
            onSelect={onTogglePinned}
          >
            <span
              className={cn(
                ACTIVITY_MENU_ICON_CLASS,
                item.isPinned &&
                  "border-forge-teal/20 bg-forge-teal/8 text-forge-teal",
              )}
            >
              {item.isPinned ? (
                <PinOff className="size-4" />
              ) : (
                <Pin className="size-4" />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {item.isPinned ? "Unpin chat" : "Pin chat"}
            </span>
          </ContextMenuItem>
          <ContextMenuItem
            className={cn(
              ACTIVITY_MENU_ITEM_CLASS,
              isMuted && "text-forge-teal",
            )}
            onSelect={onToggleMuted}
          >
            <span
              className={cn(
                ACTIVITY_MENU_ICON_CLASS,
                isMuted &&
                  "border-forge-teal/20 bg-forge-teal/8 text-forge-teal",
              )}
            >
              {isMuted ? (
                <Bell className="size-4" />
              ) : (
                <BellOff className="size-4" />
              )}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {isMuted ? "Unmute chat" : "Mute chat"}
            </span>
          </ContextMenuItem>
          {item.unreadCount > 0 ? (
            <ContextMenuItem
              className={ACTIVITY_MENU_ITEM_CLASS}
              onSelect={onMarkRead}
            >
              <span className={ACTIVITY_MENU_ICON_CLASS}>
                <CheckCheck className="size-4" />
              </span>
              <span className="min-w-0 flex-1 truncate">Mark as read</span>
            </ContextMenuItem>
          ) : null}
        </ContextMenuContent>
      </ContextMenu>
    );
  },
);

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
