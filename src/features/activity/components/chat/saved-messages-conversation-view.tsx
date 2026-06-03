import {
  Bookmark,
  Forward,
  MessageCircle,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  type KeyboardEvent,
  type MouseEvent,
  memo,
  useMemo,
  useState,
} from "react";
import { NoSavedMessagesVisual } from "@/assets/empty-state/no-saved-messages";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { getActivityConversationKey } from "@/features/activity/lib/activity-conversation-key";
import { formatRelativeTime } from "@/features/activity/lib/chat-utils";
import { isVisualAttachment } from "@/features/activity/lib/gif-attachments";
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
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
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
          avatarKind="saved"
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
          <div className="relative z-10 h-full overflow-y-auto px-3 pt-4 pb-safe-bottom sm:px-5">
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
                icon={searchQuery.trim() ? "search" : "saved"}
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
  const savedGalleryRounding = getSavedMessageGalleryRounding(galleryRounding);
  const hasVisualAttachments = attachments.some(isVisualAttachment);
  const hasContextPreview = Boolean(
    message.replyTo || message.forwardedFromMessageId,
  );
  const bubbleSizeClass = getSavedMessageBubbleSizeClass({
    content: displayContent,
    hasContextPreview,
    hasVisualAttachments,
    visualAttachmentCount: attachments.filter(isVisualAttachment).length,
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
    <article className="group/saved-message flex w-full min-w-0 items-start gap-2.5 sm:gap-3">
      <Avatar
        src={message.sender?.avatar}
        name={senderName}
        className="mt-6 size-8 bg-muted text-muted-foreground text-xs shadow-sm ring-1 ring-border"
        fallbackClassName="text-muted-foreground"
      />

      <div className="flex min-w-0 flex-1 flex-col items-start">
        <div className="mb-1 flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 px-1">
          <span className="max-w-32 shrink-0 truncate font-bold text-forge-teal text-micro">
            {isOwn ? "You" : senderName}
          </span>
          <StatusPill
            icon={MessageCircle}
            iconClassName="size-3"
            tone="teal"
            size="xs"
            surface="outline"
            className="min-w-0 max-w-full shrink gap-1.5 border-forge-teal/15 bg-forge-teal/8 px-2 py-1 sm:max-w-72"
          >
            <span className="truncate">From {row.conversationTitle}</span>
          </StatusPill>
          <span className="font-bold text-micro text-slate-muted/75">
            saved {formatRelativeTime(savedAt)}
          </span>
        </div>

        {/* biome-ignore lint/a11y/useSemanticElements: Saved bubbles contain nested action buttons, so they cannot be native buttons. */}
        <div
          tabIndex={0}
          role="button"
          aria-label={`Open original saved message from ${senderName}`}
          className={cn(
            "relative flex min-w-0 cursor-pointer flex-col rounded-xl rounded-tl-none px-1 py-1 text-left shadow-xs transition duration-300",
            bubbleSizeClass,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
            isOwn
              ? "border border-forge-teal/15 bg-forge-teal/8 text-ink shadow-sm backdrop-blur-md"
              : "border border-border/60 bg-card/75 text-ink shadow-sm backdrop-blur-md",
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
            galleryRounding={savedGalleryRounding}
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

        <div className="mt-1 flex w-full max-w-2xl flex-wrap items-center gap-x-2 gap-y-1 px-2">
          <span className="inline-flex items-center gap-1 font-bold text-micro text-slate-muted/70">
            <Bookmark className="size-3 fill-current" aria-hidden="true" />
            Opens original message
          </span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 px-2 text-destructive/80 text-micro opacity-70 focus-visible:ring-destructive/25 hover:enabled:bg-destructive/8 hover:enabled:text-destructive md:opacity-0 md:group-hover/saved-message:opacity-100"
            contentClassName="gap-1"
            onClick={handleRemove}
          >
            <Trash2 className="size-3" aria-hidden="true" />
            Remove
          </Button>
        </div>
      </div>
    </article>
  );
}

function getSavedMessageBubbleSizeClass({
  content,
  hasContextPreview,
  hasVisualAttachments,
  visualAttachmentCount,
}: {
  content: string;
  hasContextPreview: boolean;
  hasVisualAttachments: boolean;
  visualAttachmentCount: number;
}) {
  if (hasVisualAttachments && !content && !hasContextPreview) {
    return visualAttachmentCount > 1
      ? "w-72 max-w-full sm:w-96"
      : "w-fit max-w-full";
  }

  if (hasContextPreview) {
    return "w-fit min-w-72 max-w-full sm:max-w-xl md:max-w-2xl";
  }

  if (content.length > 80) {
    return "w-fit max-w-full sm:max-w-xl md:max-w-2xl";
  }

  return "w-fit max-w-full";
}

function getSavedMessageGalleryRounding(rounding: string) {
  const nextRounding = rounding
    .split(" ")
    .filter(
      (className) =>
        !["rounded-br-none", "rounded-bl-none"].includes(className),
    )
    .join(" ");

  return cn(nextRounding, "rounded-tl-none");
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
    <StatusPill
      icon={Forward}
      iconClassName="size-3"
      tone={isOwn ? "teal" : "neutral"}
      surface="soft"
      className={cn(
        "mx-1.5 mt-1 mb-0.5 min-w-0 shrink rounded-lg px-1.5",
        !isOwn && "bg-muted/55 text-slate-muted",
      )}
    >
      <span className="min-w-0 truncate">
        Forwarded{sourceName ? ` from ${sourceName}` : ""}
      </span>
    </StatusPill>
  );
}

function SavedMessagesLoadingState() {
  const placeholders = [
    "saved-message-loading-1",
    "saved-message-loading-2",
    "saved-message-loading-3",
    "saved-message-loading-4",
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      {placeholders.map((key) => (
        <div
          key={key}
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
  icon: "retry" | "saved" | "search";
  onAction?: () => Promise<void> | void;
  title: string;
}) {
  const Icon = icon === "retry" ? RefreshCw : Search;

  return (
    <div className="flex h-full min-h-80 items-center justify-center px-4 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        {icon === "saved" ? (
          <NoSavedMessagesVisual className="h-36 w-auto text-foreground" />
        ) : (
          <IconTile
            icon={Icon}
            iconClassName="size-5"
            size="xl"
            shape="circle"
            tone="teal"
            bordered
            className="border-forge-teal/15 bg-forge-teal/8"
          />
        )}
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
