import { Bookmark, ChevronRight } from "lucide-react";
import { memo } from "react";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { formatRelativeTime } from "@/features/activity/lib/chat-utils";
import { getMessagePreviewText } from "@/features/activity/lib/unify-conversations";
import { cn } from "@/shared/lib/utils";

interface SavedMessagesShortcutProps {
  count: number;
  latestSavedMessage?: SavedMessageSnapshot;
  onOpen: () => void;
}

export const SavedMessagesShortcut = memo(function SavedMessagesShortcut({
  count,
  latestSavedMessage,
  onOpen,
}: SavedMessagesShortcutProps) {
  const hasSavedMessages = count > 0;
  const preview = latestSavedMessage
    ? getMessagePreviewText(latestSavedMessage.message)
    : "Messages you save stay private here";

  return (
    <div className="border-border/60 border-b px-3 py-2">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "group/saved flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition duration-150",
          "border-border/70 bg-card/80 hover:border-forge-teal/30 hover:bg-forge-teal/6",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/25",
        )}
        aria-label="Open saved messages"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-forge-teal/20 bg-forge-teal/10 text-forge-teal">
          <Bookmark className="size-4 fill-forge-teal/15" strokeWidth={2.25} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-black text-ink text-sm tracking-tight">
              Saved messages
            </span>
            <span
              className={cn(
                "inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 font-black text-micro tabular-nums leading-none",
                hasSavedMessages
                  ? "bg-forge-teal/10 text-forge-teal"
                  : "bg-muted text-slate-muted",
              )}
            >
              {count > 99 ? "99+" : count}
            </span>
          </span>
          <span className="mt-0.5 block truncate font-medium text-slate-muted/80 text-xs leading-tight">
            {preview}
          </span>
        </span>

        <span className="flex shrink-0 flex-col items-end gap-1">
          {latestSavedMessage ? (
            <time className="font-semibold text-micro text-slate-muted tabular-nums">
              {formatRelativeTime(latestSavedMessage.savedAt)}
            </time>
          ) : null}
          <ChevronRight
            className="size-3.5 text-slate-muted transition group-hover/saved:translate-x-0.5 group-hover/saved:text-forge-teal"
            strokeWidth={2.25}
          />
        </span>
      </button>
    </div>
  );
});

interface SavedMessagesHeaderProps {
  count: number;
}

export const SavedMessagesHeader = memo(function SavedMessagesHeader({
  count,
}: SavedMessagesHeaderProps) {
  return (
    <div className="border-border/60 border-b px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-black text-ink text-sm tracking-tight">
            Saved messages
          </p>
          <p className="mt-0.5 text-slate-muted text-xs leading-tight">
            Private bookmarks from every chat, newest first.
          </p>
        </div>
        <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border border-forge-teal/20 bg-forge-teal/10 px-2 font-black text-forge-teal text-xs tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      </div>
    </div>
  );
});
