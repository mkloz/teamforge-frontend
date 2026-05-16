import { Bookmark, MessageCircle, X } from "lucide-react";
import { type KeyboardEvent, memo } from "react";
import type {
  UnifiedConversation,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import { formatRelativeTime } from "@/features/activity/lib/chat-utils";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import {
  getConversationAvatarUrl,
  getConversationTitle,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";
import { Avatar } from "@/shared/components/common/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { cn } from "@/shared/lib/utils";

interface SavedMessageListItemProps {
  conversation?: UnifiedConversation;
  density?: "default" | "compact";
  isSelected: boolean;
  onRemove: (messageId: string) => Promise<void> | void;
  onSelect: () => void;
  snapshot: SavedMessageSnapshot;
}

const MENU_CONTENT_CLASS =
  "w-52 rounded-lg border border-border/60 bg-canvas/97 p-1 text-ink shadow-[0_1px_5px_color-mix(in_srgb,var(--color-ink)_6%,transparent)] backdrop-blur-xl dark:bg-forge-deep-surface/97";

const MENU_ITEM_CLASS =
  "min-h-8 gap-2 rounded-md px-2 py-1.5 font-bold text-xs focus:bg-forge-teal/8 focus:text-ink data-[highlighted]:bg-forge-teal/8 data-[highlighted]:text-ink";

export const SavedMessageListItem = memo(function SavedMessageListItem({
  conversation,
  density = "default",
  isSelected,
  onRemove,
  onSelect,
  snapshot,
}: SavedMessageListItemProps) {
  const isCompact = density === "compact";
  const title = conversation
    ? getConversationTitle(conversation)
    : "Saved message";
  const avatarUrl = conversation
    ? getConversationAvatarUrl(conversation)
    : null;
  const message = snapshot.message;
  const sender = getSavedMessageSender(message);
  const preview = getMessagePreviewText(message);
  const rowKey = getActivityConversationKey(
    snapshot.conversationKind,
    snapshot.conversationId,
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onSelect();
  }

  function removeBookmark() {
    void onRemove(message.id);
  }

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <div
          data-conversation-key={rowKey}
          onClick={onSelect}
          onKeyDown={handleKeyDown}
          role="option"
          aria-selected={isSelected}
          tabIndex={0}
          className={cn(
            "group/item relative flex w-full select-none items-center text-left outline-none transition duration-200",
            isCompact ? "gap-2.5 px-3 py-2" : "gap-3.5 px-4 py-3",
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
          <div className="relative shrink-0">
            <Avatar
              src={avatarUrl}
              name={title}
              shape={
                snapshot.conversationKind === "group" ? "rounded" : "circle"
              }
              className={cn(
                "shadow-sm ring-1 ring-border/50 transition-colors duration-200 group-hover/item:ring-forge-teal/30",
                snapshot.conversationKind === "group" && "rounded-md",
                isCompact ? "size-9" : "size-11",
              )}
            />
            <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border border-canvas bg-forge-teal text-canvas shadow-sm">
              <Bookmark className="size-2.5 fill-current" />
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <h3 className="truncate font-bold text-ink/90 text-sm tracking-tight transition-colors group-hover/item:text-ink">
                  {title}
                </h3>
                <span className="type-signature-label inline-flex shrink-0 items-center rounded-full bg-forge-teal/8 px-1.5 py-0.5 font-bold text-forge-teal leading-none">
                  Saved
                </span>
              </div>
              <time className="shrink-0 font-medium text-micro text-slate-muted tabular-nums">
                Saved {formatRelativeTime(snapshot.savedAt)}
              </time>
            </div>

            <div
              className={cn(
                "flex items-center gap-2",
                isCompact ? "mt-0" : "mt-0.5",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-slate-muted/80 text-xs leading-tight group-hover/item:text-slate-muted">
                  {sender ? (
                    <span className="font-bold text-forge-teal/90">
                      {sender}:{" "}
                    </span>
                  ) : null}
                  {preview}
                </p>
                <p className="mt-0.5 truncate font-medium text-micro text-slate-muted/60">
                  Opens in the original chat
                </p>
              </div>
              <button
                type="button"
                aria-label="Remove bookmark"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-transparent text-slate-muted/70 opacity-60 transition hover:border-destructive/20 hover:bg-destructive/8 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/25 sm:opacity-0 sm:group-hover/item:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
                  removeBookmark();
                }}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className={MENU_CONTENT_CLASS}>
        <ContextMenuItem className={MENU_ITEM_CLASS} onSelect={onSelect}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-background/65 text-muted-foreground">
            <MessageCircle className="size-4" />
          </span>
          <span className="min-w-0 flex-1 truncate">Open message</span>
        </ContextMenuItem>
        <ContextMenuSeparator className="my-1 bg-border/55" />
        <ContextMenuItem
          className={cn(
            MENU_ITEM_CLASS,
            "text-destructive focus:bg-destructive/8 data-[highlighted]:bg-destructive/8",
          )}
          onSelect={removeBookmark}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-destructive/20 bg-destructive/8 text-destructive">
            <X className="size-4" />
          </span>
          <span className="min-w-0 flex-1 truncate">Remove bookmark</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

function getSavedMessageSender(message: UnifiedMessage) {
  if (message.isSystem) {
    return "System";
  }

  return message.sender?.name ?? null;
}
