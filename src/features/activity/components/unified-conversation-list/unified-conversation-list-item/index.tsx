import {
  Bell,
  BellOff,
  CheckCheck,
  MessageCircle,
  Pin,
  PinOff,
} from "lucide-react";
import { type KeyboardEvent, memo } from "react";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { getConversationIsMuted } from "@/features/activity/lib/unify-conversations";
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

const MENU_CONTENT_CLASS =
  "w-48 rounded-lg border border-border/60 bg-canvas/97 p-1 text-ink shadow-[0_1px_5px_color-mix(in_srgb,var(--color-ink)_6%,transparent)] backdrop-blur-xl dark:bg-forge-deep-surface/97";

const MENU_ITEM_CLASS =
  "min-h-8 gap-2 rounded-md px-2 py-1.5 font-bold text-xs focus:bg-forge-teal/8 focus:text-ink data-[highlighted]:bg-forge-teal/8 data-[highlighted]:text-ink";

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

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      onSelect();
    };

    return (
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
          <div
            onClick={onSelect}
            onKeyDown={handleKeyDown}
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            className={cn(
              "group/item relative flex w-full select-none items-center text-left outline-none transition duration-200",
              isCompact ? "gap-2.5 px-3 py-2" : "gap-3.5 px-4 py-3.5",
              isSelected ? "bg-muted/60" : "hover:bg-muted/30",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-0 left-0 h-full w-1 bg-forge-teal opacity-0 transition-opacity duration-300",
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
        <ContextMenuContent className={MENU_CONTENT_CLASS}>
          <ContextMenuItem className={MENU_ITEM_CLASS} onSelect={onSelect}>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-background/65 text-muted-foreground">
              <MessageCircle className="size-4" />
            </span>
            <span className="min-w-0 flex-1 truncate">Open chat</span>
          </ContextMenuItem>
          <ContextMenuSeparator className="my-1 bg-border/55" />
          <ContextMenuItem
            className={cn(MENU_ITEM_CLASS, item.isPinned && "text-forge-teal")}
            onSelect={onTogglePinned}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-background/65 text-muted-foreground",
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
            className={cn(MENU_ITEM_CLASS, isMuted && "text-forge-teal")}
            onSelect={onToggleMuted}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-background/65 text-muted-foreground",
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
            <ContextMenuItem className={MENU_ITEM_CLASS} onSelect={onMarkRead}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-background/65 text-muted-foreground">
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
