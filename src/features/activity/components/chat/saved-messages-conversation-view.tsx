import {
  Bookmark,
  Forward,
  MessageCircle,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { type KeyboardEvent, type MouseEvent, useState } from "react";
import { NoSavedMessagesVisual } from "@/features/activity/assets/no-saved-messages";
import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import type { UnifiedConversation } from "@/features/activity/lib/activity-contract";
import { formatRelativeTime } from "@/features/activity/lib/chat-utils";
import type { SavedMessageSnapshot } from "@/features/activity/lib/saved-message";
import { SAVED_MESSAGES_TITLE } from "@/features/activity/lib/saved-messages-identity";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import {
  getSavedMessageBubbleSizeClass,
  getSavedMessageBubbleViewState,
  getSavedMessageForwardedIndicatorViewState,
  getSavedMessageGalleryRounding,
  getSavedMessageRows,
  getSavedMessagesContentViewState,
  getSavedMessagesSubtitle,
  isSavedMessageOpenKey,
  type SavedMessageBubbleViewState,
  type SavedMessageRow,
  type SavedMessagesStateViewState,
  shouldUseSavedMessageInlineFooter,
} from "./saved-messages-conversation-view-state";
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

interface SavedMessagesContentProps {
  isError: boolean;
  isLoading: boolean;
  isRetrying: boolean;
  rows: SavedMessageRow[];
  savedMessagesCount: number;
  searchQuery: string;
  onOpenMessage: (snapshot: SavedMessageSnapshot) => void;
  onRemoveMessage: (messageId: string) => Promise<void> | void;
  onRetry?: () => Promise<void> | void;
}

type SavedMessageLayoutState = ReturnType<typeof useMessageLayout>;

export function SavedMessagesConversationView({
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
  const rows = getSavedMessageRows(savedMessages, conversations, searchQuery);
  const savedMessagesCount = savedMessages.length;
  const subtitle = getSavedMessagesSubtitle(savedMessagesCount);

  return (
    <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas/40">
      <ChatBackground />

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

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="relative z-10 h-full overflow-y-auto px-3 pt-4 pb-safe-bottom sm:px-5">
          <SavedMessagesContent
            isError={isError}
            isLoading={isLoading}
            isRetrying={isRetrying}
            rows={rows}
            savedMessagesCount={savedMessagesCount}
            searchQuery={searchQuery}
            onOpenMessage={onOpenMessage}
            onRemoveMessage={onRemoveMessage}
            onRetry={onRetry}
          />
        </div>
      </div>
    </div>
  );
}

function SavedMessagesContent({
  isError,
  isLoading,
  isRetrying,
  rows,
  savedMessagesCount,
  searchQuery,
  onOpenMessage,
  onRemoveMessage,
  onRetry,
}: SavedMessagesContentProps) {
  const contentState = getSavedMessagesContentViewState({
    isError,
    isLoading,
    isRetrying,
    rowsCount: rows.length,
    savedMessagesCount,
    searchQuery,
  });

  if (contentState.kind === "error") {
    return <SavedMessagesState {...contentState.state} onAction={onRetry} />;
  }

  if (contentState.kind === "loading") {
    return <SavedMessagesLoadingState />;
  }

  if (contentState.kind === "empty") {
    return <SavedMessagesState {...contentState.state} />;
  }

  return (
    <SavedMessagesResultList
      rows={rows}
      onOpenMessage={onOpenMessage}
      onRemoveMessage={onRemoveMessage}
    />
  );
}

function SavedMessagesResultList({
  rows,
  onOpenMessage,
  onRemoveMessage,
}: {
  rows: SavedMessageRow[];
  onOpenMessage: (snapshot: SavedMessageSnapshot) => void;
  onRemoveMessage: (messageId: string) => Promise<void> | void;
}) {
  return (
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
  );
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
  const { message } = row.snapshot;
  const viewState = getSavedMessageBubbleViewState(row);
  const { galleryRounding, isReadByOthers, reactionGroups } = useMessageLayout({
    message,
    isOwn: viewState.isOwn,
  });
  const savedGalleryRounding = getSavedMessageGalleryRounding(galleryRounding);
  const bubbleSizeClass = getSavedMessageBubbleSizeClass({
    content: viewState.displayContent,
    hasContextPreview: viewState.hasContextPreview,
    hasVisualAttachments: viewState.hasVisualAttachments,
    visualAttachmentCount: viewState.visualAttachmentCount,
  });
  const usesInlineFooter = shouldUseSavedMessageInlineFooter({
    displayContent: viewState.displayContent,
    hasReply: Boolean(message.replyTo),
    reactionGroupsLength: reactionGroups.length,
  });

  return (
    <article className="group/saved-message flex w-full min-w-0 items-start gap-2.5 sm:gap-3">
      <Avatar
        src={message.sender?.avatar}
        name={viewState.senderName}
        className="mt-6 size-8 bg-muted text-muted-foreground text-xs shadow-sm ring-1 ring-border"
        fallbackClassName="text-muted-foreground"
      />

      <div className="flex min-w-0 flex-1 flex-col items-start">
        <SavedMessageBubbleHeader
          conversationTitle={row.conversationTitle}
          isOwn={viewState.isOwn}
          savedAt={viewState.savedAt}
          senderName={viewState.senderName}
        />

        <SavedMessageOpenTarget
          bubbleSizeClass={bubbleSizeClass}
          galleryRounding={savedGalleryRounding}
          isReadByOthers={isReadByOthers}
          message={message}
          onOpen={onOpen}
          reactionGroups={reactionGroups}
          usesInlineFooter={usesInlineFooter}
          viewState={viewState}
        />

        <SavedMessageBubbleActions onRemove={onRemove} />
      </div>
    </article>
  );
}

function SavedMessageOpenTarget({
  bubbleSizeClass,
  galleryRounding,
  isReadByOthers,
  message,
  onOpen,
  reactionGroups,
  usesInlineFooter,
  viewState,
}: {
  bubbleSizeClass: string;
  galleryRounding: string;
  isReadByOthers: boolean;
  message: SavedMessageSnapshot["message"];
  onOpen: () => void;
  reactionGroups: SavedMessageLayoutState["reactionGroups"];
  usesInlineFooter: boolean;
  viewState: SavedMessageBubbleViewState;
}) {
  function handleOpenKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.currentTarget !== event.target) {
      return;
    }

    if (isSavedMessageOpenKey(event.key)) {
      event.preventDefault();
      onOpen();
    }
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: Saved bubbles contain nested action buttons, so they cannot be native buttons.
    <div
      tabIndex={0}
      // react-doctor-disable-next-line react-doctor/prefer-tag-over-role -- Saved bubbles contain nested action buttons, so replacing this open target with a native button would create invalid interactive nesting.
      role="button"
      aria-label={`Open original saved message from ${viewState.senderName}`}
      className={cn(
        "relative flex min-w-0 cursor-pointer flex-col rounded-xl rounded-tl-none px-1 py-1 text-left shadow-xs transition duration-300",
        bubbleSizeClass,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        viewState.isOwn
          ? "border border-primary/15 bg-primary/8 text-ink shadow-sm backdrop-blur-md"
          : "border border-border/60 bg-card/75 text-ink shadow-sm backdrop-blur-md",
        !viewState.displayContent && "min-w-30",
        usesInlineFooter && "min-w-40",
      )}
      onClick={onOpen}
      onKeyDown={handleOpenKeyDown}
    >
      <SavedMessageOpenTargetContents
        galleryRounding={galleryRounding}
        isReadByOthers={isReadByOthers}
        message={message}
        onOpen={onOpen}
        reactionGroups={reactionGroups}
        viewState={viewState}
      />
    </div>
  );
}

function SavedMessageOpenTargetContents({
  galleryRounding,
  isReadByOthers,
  message,
  onOpen,
  reactionGroups,
  viewState,
}: {
  galleryRounding: string;
  isReadByOthers: boolean;
  message: SavedMessageSnapshot["message"];
  onOpen: () => void;
  reactionGroups: SavedMessageLayoutState["reactionGroups"];
  viewState: SavedMessageBubbleViewState;
}) {
  return (
    <>
      <ForwardedIndicator message={message} isOwn={viewState.isOwn} />

      <ReplyReference
        replyTo={message.replyTo}
        isOwn={viewState.isOwn}
        onActivate={() => onOpen()}
      />

      <MessageMedia
        attachments={message.attachments}
        isOwn={viewState.isOwn}
        content={viewState.displayContent}
        createdAt={message.createdAt}
        status={message.status}
        isReadByOthers={isReadByOthers}
        galleryRounding={galleryRounding}
        reactionGroupsLength={reactionGroups.length}
        replyTo={message.replyTo}
      />

      <MessageContent
        content={viewState.displayContent}
        hasReply={Boolean(message.replyTo)}
        isOwn={viewState.isOwn}
        reactionGroupsLength={reactionGroups.length}
      />

      <MessageFooter
        attachments={message.attachments}
        content={viewState.displayContent}
        createdAt={message.createdAt}
        footerState={{
          hasReply: Boolean(message.replyTo),
          isEdited: message.isEdited,
          isOwn: viewState.isOwn,
          isPinned: message.isPinned,
          isReadByOthers,
          isSaved: true,
        }}
        reactionGroups={reactionGroups}
        status={message.status}
      />
    </>
  );
}

function SavedMessageBubbleHeader({
  conversationTitle,
  isOwn,
  savedAt,
  senderName,
}: {
  conversationTitle: string;
  isOwn: boolean;
  savedAt: SavedMessageSnapshot["savedAt"];
  senderName: string;
}) {
  return (
    <div className="mb-1 flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 px-1">
      <span className="max-w-32 shrink-0 truncate font-bold text-micro text-primary">
        {isOwn ? "You" : senderName}
      </span>
      <StatusPill
        icon={MessageCircle}
        iconClassName="size-3"
        tone="teal"
        size="xs"
        surface="outline"
        className="min-w-0 max-w-full shrink gap-1.5 border-primary/15 bg-primary/8 px-2 py-1 sm:max-w-72"
      >
        <span className="truncate">From {conversationTitle}</span>
      </StatusPill>
      <span className="font-bold text-micro text-slate-muted/75">
        saved {formatRelativeTime(savedAt)}
      </span>
    </div>
  );
}

function SavedMessageBubbleActions({
  onRemove,
}: {
  onRemove: () => Promise<void> | void;
}) {
  function handleRemove(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    void onRemove();
  }

  return (
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
  );
}

function ForwardedIndicator({
  message,
  isOwn,
}: {
  message: SavedMessageSnapshot["message"];
  isOwn: boolean;
}) {
  const viewState = getSavedMessageForwardedIndicatorViewState({
    isOwn,
    message,
  });

  if (!viewState) {
    return null;
  }

  return (
    <StatusPill
      icon={Forward}
      iconClassName="size-3"
      tone={viewState.tone}
      surface="soft"
      className={viewState.className}
    >
      <span className="min-w-0 truncate">{viewState.label}</span>
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
  onAction?: () => Promise<void> | void;
} & SavedMessagesStateViewState) {
  return (
    <div className="flex h-full min-h-80 items-center justify-center px-4 text-center">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <SavedMessagesStateVisual icon={icon} />
        <div>
          <h2 className="font-black text-ink text-lg tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <SavedMessagesStateAction
          actionDisabled={actionDisabled}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      </div>
    </div>
  );
}

function SavedMessagesStateVisual({
  icon,
}: {
  icon: SavedMessagesStateViewState["icon"];
}) {
  if (icon === "saved") {
    return <NoSavedMessagesVisual className="h-36 w-auto text-foreground" />;
  }

  const Icon = icon === "retry" ? RefreshCw : Search;

  return (
    <IconTile
      icon={Icon}
      iconClassName="size-5"
      size="xl"
      shape="circle"
      tone="teal"
      bordered
      className="border-primary/15 bg-primary/8"
    />
  );
}

function SavedMessagesStateAction({
  actionDisabled,
  actionLabel,
  onAction,
}: {
  actionDisabled?: boolean;
  actionLabel?: string;
  onAction?: () => Promise<void> | void;
}) {
  if (!actionLabel || !onAction) {
    return null;
  }

  return (
    <Button
      disabled={actionDisabled}
      size="sm"
      variant="primary"
      onClick={() => void onAction()}
    >
      {actionLabel}
    </Button>
  );
}
