import { Bookmark, ChevronRight, MessageCircle, Trash2 } from "lucide-react";
import { memo } from "react";
import {
  ACTIVITY_MENU_ICON_CLASS,
  ACTIVITY_MENU_ITEM_CLASS,
  ACTIVITY_MENU_SEPARATOR_CLASS,
  getActivityMenuContentClass,
} from "@/features/activity/components/activity-popup-styles";
import { formatRelativeTime } from "@/features/activity/lib/chat-utils";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import {
  SAVED_MESSAGES_SUBTITLE,
  SAVED_MESSAGES_TITLE,
} from "@/features/activity/lib/saved-messages-identity";
import { getMessagePreviewText } from "@/features/activity/lib/unify-conversations";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { cn } from "@/shared/lib/utils";

interface SavedMessagesChatListItemProps {
  count: number;
  density?: "default" | "compact";
  isSelected: boolean;
  latestSavedMessage?: SavedMessageSnapshot;
  onRemoveLatest?: () => Promise<void> | void;
  onSelect: () => void;
}

export const SavedMessagesChatListItem = memo(
  function SavedMessagesChatListItem({
    count,
    density = "default",
    isSelected,
    latestSavedMessage,
    onRemoveLatest,
    onSelect,
  }: SavedMessagesChatListItemProps) {
    const isCompact = density === "compact";
    const preview = latestSavedMessage
      ? getMessagePreviewText(latestSavedMessage.message)
      : "Save messages from any chat to find them here.";

    return (
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "group/item relative flex w-full cursor-pointer select-none items-center text-left outline-none transition duration-200",
              isCompact
                ? "min-h-14 gap-2.5 px-3 py-2 md:min-h-0"
                : "min-h-16 gap-3.5 px-4 py-3.5 md:min-h-0",
              isSelected ? "bg-muted/60" : "hover:bg-muted/30",
            )}
          >
            <button
              type="button"
              aria-current={isSelected ? "true" : undefined}
              aria-label={`${SAVED_MESSAGES_TITLE}, ${count} saved messages`}
              className="absolute inset-0 z-10 cursor-pointer appearance-none rounded-none border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35 focus-visible:ring-inset"
              onClick={onSelect}
            >
              <span className="sr-only">Open saved messages</span>
            </button>

            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute top-0 left-0 z-20 h-full w-1 bg-forge-teal opacity-0 transition-opacity duration-300",
                isSelected ? "opacity-100" : "group-hover/item:opacity-40",
              )}
            />

            <span
              className={cn(
                "relative flex shrink-0 items-center justify-center rounded-full border border-forge-teal/20 bg-forge-teal/10 text-forge-teal shadow-sm ring-1 ring-border/40",
                isCompact ? "size-10 md:size-9" : "size-11",
              )}
              aria-hidden="true"
            >
              <Bookmark
                className="size-4 fill-forge-teal/15"
                strokeWidth={2.25}
              />
              {count > 0 ? (
                <span className="absolute -right-1 -bottom-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-canvas bg-forge-teal px-1 font-black text-canvas text-micro leading-none shadow-sm">
                  {count > 9 ? "9+" : count}
                </span>
              ) : null}
            </span>

            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <h3 className="min-w-0 truncate font-bold text-ink/90 text-sm tracking-tight transition-colors group-hover/item:text-ink">
                    {SAVED_MESSAGES_TITLE}
                  </h3>
                  <span className="type-signature-label inline-flex shrink-0 items-center rounded-full bg-forge-teal/8 px-1.5 py-0.5 font-bold text-forge-teal leading-none">
                    Private
                  </span>
                </div>
                {latestSavedMessage ? (
                  <time className="shrink-0 font-medium text-micro text-slate-muted tabular-nums">
                    {formatRelativeTime(latestSavedMessage.savedAt)}
                  </time>
                ) : null}
              </div>

              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p className="min-w-0 flex-1 truncate text-slate-muted/80 text-xs leading-tight group-hover/item:text-slate-muted">
                  {count > 0 ? preview : SAVED_MESSAGES_SUBTITLE}
                </p>
                <ChevronRight
                  className="size-3.5 shrink-0 text-slate-muted/70 transition group-hover/item:translate-x-0.5 group-hover/item:text-forge-teal"
                  strokeWidth={2.25}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent
          aria-label="Saved messages actions"
          className={getActivityMenuContentClass("w-52")}
        >
          <ContextMenuItem
            className={ACTIVITY_MENU_ITEM_CLASS}
            onSelect={onSelect}
          >
            <span className={ACTIVITY_MENU_ICON_CLASS}>
              <MessageCircle className="size-4" />
            </span>
            <span className="min-w-0 flex-1 truncate">Open saved messages</span>
          </ContextMenuItem>
          {latestSavedMessage && onRemoveLatest ? (
            <>
              <ContextMenuSeparator
                className={ACTIVITY_MENU_SEPARATOR_CLASS}
              />
              <ContextMenuItem
                className={cn(ACTIVITY_MENU_ITEM_CLASS, "text-destructive")}
                onSelect={() => void onRemoveLatest()}
              >
                <span
                  className={cn(
                    ACTIVITY_MENU_ICON_CLASS,
                    "text-destructive",
                  )}
                >
                  <Trash2 className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate">
                  Remove latest bookmark
                </span>
              </ContextMenuItem>
            </>
          ) : null}
        </ContextMenuContent>
      </ContextMenu>
    );
  },
);
