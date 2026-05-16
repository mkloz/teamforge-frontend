import {
  Bookmark,
  MessageCircle,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import {
  formatChatTime,
  formatRelativeTime,
} from "@/features/activity/lib/chat-utils";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import {
  SAVED_MESSAGES_SUBTITLE,
  SAVED_MESSAGES_TITLE,
} from "@/features/activity/lib/saved-messages-identity";
import {
  getConversationTitle,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { UnifiedChatHeader } from "./unified-conversation-view/unified-chat-header";
import { ChatBackground } from "./unified-conversation-view/unified-message-list/chat-background";

interface SavedMessagesConversationViewProps {
  conversations: UnifiedConversation[];
  isError?: boolean;
  isLoading?: boolean;
  isRetrying?: boolean;
  savedMessages: SavedMessageSnapshot[];
  onBack: () => void;
  onOpenMessage: (snapshot: SavedMessageSnapshot) => void;
  onRemoveMessage: (messageId: string) => Promise<void> | void;
  onRetry?: () => Promise<void> | void;
}

interface SavedMessageRow {
  conversationTitle: string;
  snapshot: SavedMessageSnapshot;
}

export const SavedMessagesConversationView = memo(
  function SavedMessagesConversationView({
    conversations,
    isError = false,
    isLoading = false,
    isRetrying = false,
    savedMessages,
    onBack,
    onOpenMessage,
    onRemoveMessage,
    onRetry,
  }: SavedMessagesConversationViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const rows = useSavedMessageRows(savedMessages, conversations, searchQuery);
    const subtitle =
      savedMessages.length > 0
        ? `${savedMessages.length} private bookmark${
            savedMessages.length === 1 ? "" : "s"
          }`
        : SAVED_MESSAGES_SUBTITLE;

    return (
      <div className="flex min-h-0 flex-1 flex-col bg-canvas/40">
        <UnifiedChatHeader
          kind="dm"
          title={SAVED_MESSAGES_TITLE}
          subtitle={subtitle}
          showAction={false}
          searchQuery={searchQuery}
          searchResultLabel={
            searchQuery.trim() ? `${rows.length} found` : undefined
          }
          isSearchNavigationDisabled
          onBack={onBack}
          onSearchQueryChange={setSearchQuery}
          onToggleAction={() => {}}
        />

        <div className="relative min-h-0 flex-1 overflow-hidden bg-canvas">
          <ChatBackground />
          <div className="relative z-10 h-full overflow-y-auto px-3 py-4 sm:px-5">
            {isError && savedMessages.length === 0 ? (
              <SavedMessagesState
                icon="retry"
                title="Saved messages did not load"
                description="Retry to bring your private bookmarks back."
                actionLabel={isRetrying ? "Retrying..." : "Retry"}
                actionDisabled={isRetrying}
                onAction={onRetry}
              />
            ) : isLoading && savedMessages.length === 0 ? (
              <SavedMessagesLoadingState />
            ) : rows.length === 0 ? (
              <SavedMessagesState
                icon="search"
                title={
                  searchQuery.trim()
                    ? "No saved messages found"
                    : "No saved messages yet"
                }
                description={
                  searchQuery.trim()
                    ? "Try a sender, chat name, or a phrase from the message."
                    : "Use Save message from any message menu. This chat stays separate from My notes."
                }
              />
            ) : (
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                {rows.map((row) => (
                  <SavedMessageBubble
                    key={row.snapshot.message.id}
                    row={row}
                    onOpen={() => onOpenMessage(row.snapshot)}
                    onRemove={() => onRemoveMessage(row.snapshot.message.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

function useSavedMessageRows(
  savedMessages: SavedMessageSnapshot[],
  conversations: UnifiedConversation[],
  searchQuery: string,
) {
  return useMemo(() => {
    const conversationsByKey = new Map(
      conversations.map((conversation) => [
        getActivityConversationKey(conversation.kind, conversation.id),
        conversation,
      ]),
    );
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return savedMessages
      .map<SavedMessageRow>((snapshot) => {
        const conversation = conversationsByKey.get(
          getActivityConversationKey(
            snapshot.conversationKind,
            snapshot.conversationId,
          ),
        );

        return {
          conversationTitle: conversation
            ? getConversationTitle(conversation)
            : "Original chat unavailable",
          snapshot,
        };
      })
      .filter((row) => {
        if (!normalizedQuery) {
          return true;
        }

        const searchable = [
          row.conversationTitle,
          row.snapshot.message.sender?.name ?? "",
          getMessagePreviewText(row.snapshot.message),
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(normalizedQuery);
      });
  }, [conversations, savedMessages, searchQuery]);
}

function SavedMessageBubble({
  row,
  onOpen,
  onRemove,
}: {
  row: SavedMessageRow;
  onOpen: () => void;
  onRemove: () => Promise<void> | void;
}) {
  const { message, savedAt } = row.snapshot;
  const senderName = message.sender?.name ?? "Unknown sender";
  const attachmentCount = message.attachments?.length ?? 0;
  const body = message.content || getMessagePreviewText(message);

  return (
    <article className="group/saved-message flex justify-start">
      <div className="w-full max-w-2xl">
        <button
          type="button"
          className={cn(
            "w-full rounded-2xl border border-border/70 bg-card/92 p-1 text-left shadow-sm backdrop-blur-md transition duration-200",
            "hover:border-forge-teal/25 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30",
          )}
          onClick={onOpen}
        >
          <div className="flex items-start justify-between gap-2 px-2 pt-1.5 pb-1">
            <div className="min-w-0">
              <p className="flex min-w-0 items-center gap-1.5 font-black text-forge-teal text-micro uppercase leading-tight">
                <MessageCircle className="size-3 shrink-0" strokeWidth={2.25} />
                <span className="truncate">From {row.conversationTitle}</span>
              </p>
              <p className="mt-0.5 truncate font-medium text-slate-muted text-xs leading-tight">
                {senderName} - saved {formatRelativeTime(savedAt)}
              </p>
            </div>
            <time className="shrink-0 pt-0.5 font-bold text-micro text-slate-muted/70 tabular-nums">
              {formatChatTime(message.createdAt)}
            </time>
          </div>

          <div className="rounded-xl bg-canvas/55">
            {attachmentCount > 0 ? (
              <div className="border-border/40 border-b px-2 py-1.5">
                <span className="inline-flex items-center rounded-full bg-forge-teal/8 px-2 py-1 font-bold text-forge-teal text-micro">
                  {attachmentCount} attachment{attachmentCount === 1 ? "" : "s"}
                </span>
              </div>
            ) : null}
            <p className="wrap-anywhere min-w-0 max-w-full whitespace-pre-wrap px-2 py-2 font-medium text-ink text-sm leading-snug">
              {body}
            </p>
          </div>
        </button>

        <div className="mt-1 flex items-center justify-between gap-2 px-2">
          <span className="inline-flex items-center gap-1 font-bold text-micro text-slate-muted/70">
            <Bookmark className="size-3 fill-current" aria-hidden="true" />
            Opens original message
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-bold text-destructive/80 text-micro opacity-70 transition hover:bg-destructive/8 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/25 md:opacity-0 md:group-hover/saved-message:opacity-100"
            onClick={() => void onRemove()}
          >
            <Trash2 className="size-3" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function SavedMessagesLoadingState() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-2xl border border-border/60 bg-card/70 motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

function SavedMessagesState({
  actionDisabled = false,
  actionLabel,
  description,
  icon,
  onAction,
  title,
}: {
  actionDisabled?: boolean;
  actionLabel?: string;
  description: string;
  icon: "retry" | "search";
  onAction?: () => Promise<void> | void;
  title: string;
}) {
  const Icon = icon === "retry" ? RefreshCw : Search;

  return (
    <div className="flex h-full min-h-80 items-center justify-center px-4 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full border border-forge-teal/15 bg-forge-teal/8 text-forge-teal">
          <Icon className="size-5" strokeWidth={2.25} />
        </span>
        <div>
          <h2 className="font-black text-ink text-lg tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
        {actionLabel && onAction ? (
          <Button
            className="rounded-full"
            disabled={actionDisabled}
            size="sm"
            variant="primary"
            onClick={() => void onAction()}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
