import {
  Bookmark,
  Forward,
  MessageCircle,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  memo,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import { formatRelativeTime } from "@/features/activity/lib/chat-utils";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import {
  SAVED_MESSAGES_SUBTITLE,
  SAVED_MESSAGES_TITLE,
} from "@/features/activity/lib/saved-messages-identity";
import {
  getConversationTitle,
  getMessagePreviewText,
} from "@/features/activity/lib/unify-conversations";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { UnifiedChatHeader } from "./unified-conversation-view/unified-chat-header";
import { ChatBackground } from "./unified-conversation-view/unified-message-list/chat-background";
import { MessageContent } from "./unified-conversation-view/unified-message-list/unified-message-item/message-content";
import { MessageFooter } from "./unified-conversation-view/unified-message-list/unified-message-item/message-footer";
import { MessageMedia } from "./unified-conversation-view/unified-message-list/unified-message-item/message-media";
import { ReplyReference } from "./unified-conversation-view/unified-message-list/unified-message-item/reply-reference";

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
  const isOwn = message.isOwn;
  const attachments = message.attachments ?? [];
  const displayContent =
    message.content ||
    (attachments.length > 0 ? "" : getMessagePreviewText(message));
  const { galleryRounding, isReadByOthers, reactionGroups } = useMessageLayout({
    message,
    isOwn,
  });
  const usesInlineFooter =
    displayContent.trim().length > 0 &&
    !message.replyTo &&
    displayContent.length < 50 &&
    !displayContent.includes(" ") &&
    reactionGroups.length === 0;

  function handleOpenKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.currentTarget !== event.target) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  }

  function handleRemove(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    void onRemove();
  }

  return (
    <article
      className={cn(
        "group/saved-message flex w-full min-w-0 items-end gap-3",
        isOwn ? "flex-row-reverse justify-start" : "justify-start",
      )}
    >
      {!isOwn ? (
        <Avatar
          src={message.sender?.avatar}
          name={senderName}
          className="size-8 bg-muted text-muted-foreground text-xs shadow-sm ring-1 ring-border"
          fallbackClassName="text-muted-foreground"
        />
      ) : null}

      <div
        className={cn(
          "flex w-full min-w-0 max-w-xs flex-col sm:max-w-lg md:max-w-xl",
          isOwn ? "ml-auto items-end" : "mr-auto items-start",
        )}
      >
        <div
          className={cn(
            "mb-1 flex min-w-0 max-w-full flex-wrap items-center gap-1.5 px-1.5",
            isOwn ? "justify-end text-right" : "justify-start",
          )}
        >
          <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full border border-forge-teal/15 bg-forge-teal/8 px-2 py-1 font-bold text-forge-teal text-micro leading-none">
            <MessageCircle className="size-3 shrink-0" strokeWidth={2.25} />
            <span className="truncate">From {row.conversationTitle}</span>
          </span>
          <span className="font-bold text-micro text-slate-muted/75">
            saved {formatRelativeTime(savedAt)}
          </span>
        </div>

        {!isOwn ? (
          <p className="mb-0.5 ml-1.5 font-bold text-forge-teal text-micro opacity-90">
            {senderName}
          </p>
        ) : null}

        <div
          tabIndex={0}
          role="button"
          aria-label={`Open original saved message from ${senderName}`}
          className={cn(
            "relative flex w-fit min-w-0 max-w-full cursor-pointer flex-col rounded-xl px-1 py-1 text-left shadow-xs transition duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
            isOwn
              ? "rounded-br-none border border-forge-teal/15 bg-forge-teal/10 text-ink shadow-sm backdrop-blur-md"
              : "rounded-bl-none border border-border/70 bg-card/90 text-ink shadow-sm backdrop-blur-md",
            !displayContent && "min-w-30",
            usesInlineFooter && "min-w-40",
          )}
          onClick={onOpen}
          onKeyDown={handleOpenKeyDown}
        >
          <ForwardedIndicator message={message} isOwn={isOwn} />

          <ReplyReference
            replyTo={message.replyTo}
            isOwn={isOwn}
            onActivate={() => onOpen()}
          />

          <MessageMedia
            attachments={message.attachments}
            isOwn={isOwn}
            content={displayContent}
            createdAt={message.createdAt}
            status={message.status}
            isReadByOthers={isReadByOthers}
            galleryRounding={galleryRounding}
            reactionGroupsLength={reactionGroups.length}
            replyTo={message.replyTo}
          />

          <MessageContent
            content={displayContent}
            hasReply={Boolean(message.replyTo)}
            isOwn={isOwn}
            reactionGroupsLength={reactionGroups.length}
          />

          <MessageFooter
            attachments={message.attachments}
            content={displayContent}
            reactionGroups={reactionGroups}
            isOwn={isOwn}
            createdAt={message.createdAt}
            status={message.status}
            isReadByOthers={isReadByOthers}
            isEdited={message.isEdited}
            isPinned={message.isPinned}
            isSaved
            hasReply={Boolean(message.replyTo)}
          />
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-2 px-2",
            isOwn ? "justify-end" : "justify-start",
          )}
        >
          <span className="inline-flex items-center gap-1 font-bold text-micro text-slate-muted/70">
            <Bookmark className="size-3 fill-current" aria-hidden="true" />
            Opens original message
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-bold text-destructive/80 text-micro opacity-70 transition hover:bg-destructive/8 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/25 md:opacity-0 md:group-hover/saved-message:opacity-100"
            onClick={handleRemove}
          >
            <Trash2 className="size-3" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

function ForwardedIndicator({
  message,
  isOwn,
}: {
  message: SavedMessageSnapshot["message"];
  isOwn: boolean;
}) {
  if (!message.forwardedFromMessageId) {
    return null;
  }

  const sourceName = message.forwardedFromSenderName?.trim();

  return (
    <div
      className={cn(
        "mx-1.5 mt-1 mb-0.5 flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-0.5 font-bold text-micro",
        isOwn
          ? "bg-forge-teal/8 text-forge-teal"
          : "bg-muted/55 text-slate-muted",
      )}
    >
      <Forward className="size-3 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">
        Forwarded{sourceName ? ` from ${sourceName}` : ""}
      </span>
    </div>
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
