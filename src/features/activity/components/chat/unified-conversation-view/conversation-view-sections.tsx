import { AlertTriangle, RefreshCw } from "lucide-react";
import type { RefObject } from "react";

import type {
  ActivityParticipant,
  ActivitySendMessageInput,
  Group,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { CompletedReviewGate } from "./completed-banner";
import { MessageSelectionToolbar } from "./message-selection-toolbar";
import { UnifiedMessageInput } from "./unified-message-input";
import { UnifiedMessageList } from "./unified-message-list";
import type { MessageScrollHandle } from "./unified-message-list/message-scroll.types";

interface ConversationAlertBannersProps {
  isMessageError: boolean;
  isOnline: boolean;
  messageCount: number;
  onRetryMessages?: () => Promise<void> | void;
}

interface ConversationMessageAreaProps {
  activeTypingUsers: { name: string; avatar: string | null }[];
  activeMessageScrollHandleRef: RefObject<MessageScrollHandle | null>;
  conversationId: string;
  firstUnreadMessageId: string | null;
  focusedMessageId?: string | null;
  kind: "dm" | "group";
  messageListStatus: ConversationMessageListStatus;
  messages: UnifiedMessage[];
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  normalizedQuery: string;
  selectionState: ConversationMessageSelectionState;
  onLoadOlderMessages?: () => Promise<void> | void;
  onRetryMessages?: () => Promise<void> | void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  onStartSelection: (message: UnifiedMessage) => void;
  onToggleSelected: (message: UnifiedMessage) => void;
}

interface ConversationMessageListStatus {
  hasOlderMessages: boolean;
  isLoadingMessages: boolean;
  isLoadingOlderMessages: boolean;
  isMessageError: boolean;
  isNotesChat: boolean;
  isOnline: boolean;
}

interface ConversationMessageSelectionState {
  isSelectionMode: boolean;
  selectedMessageIds: ReadonlySet<string>;
}

interface ConversationComposerProps {
  chatId: string | null;
  group: Group | null;
  inputPlaceholder: string | undefined;
  isBlockedDirectChat: boolean;
  isCompleted: boolean;
  isMessageSelectionMode: boolean;
  selectedMessages: UnifiedMessage[];
  sendError: string | null;
  onClearSelection: () => void;
  onClearSendError?: () => void;
  onCreateProposal?: () => void;
  onSendMessage: (input: ActivitySendMessageInput) => Promise<void> | void;
}

export function ConversationAlertBanners({
  isMessageError,
  isOnline,
  messageCount,
  onRetryMessages,
}: ConversationAlertBannersProps) {
  return (
    <>
      {!isOnline ? <ConversationOfflineBanner /> : null}
      {isOnline && isMessageError && messageCount > 0 ? (
        <ConversationMessageErrorBanner onRetry={onRetryMessages} />
      ) : null}
    </>
  );
}

export function ConversationMessageArea({
  activeTypingUsers,
  activeMessageScrollHandleRef,
  conversationId,
  firstUnreadMessageId,
  focusedMessageId,
  kind,
  messageListStatus,
  messages,
  messagesContainerRef,
  messagesEndRef,
  normalizedQuery,
  selectionState,
  onLoadOlderMessages,
  onRetryMessages,
  onShowParticipantProfile,
  onStartSelection,
  onToggleSelected,
}: ConversationMessageAreaProps) {
  const {
    hasOlderMessages,
    isLoadingMessages,
    isLoadingOlderMessages,
    isMessageError,
    isNotesChat,
    isOnline,
  } = messageListStatus;
  const { isSelectionMode, selectedMessageIds } = selectionState;

  return (
    <div className="relative z-10 flex-1 overflow-hidden">
      <UnifiedMessageList
        key={conversationId}
        messages={messages}
        searchQuery={normalizedQuery}
        kind={kind}
        conversationId={conversationId}
        emptyStateVariant={isNotesChat ? "my-notes" : "default"}
        focusedMessageId={focusedMessageId}
        firstUnreadMessageId={firstUnreadMessageId}
        messagesEndRef={messagesEndRef}
        containerRef={messagesContainerRef}
        messageScrollHandleRef={activeMessageScrollHandleRef}
        onLoadOlderMessages={onLoadOlderMessages}
        onRetryInitialError={onRetryMessages}
        onStartSelection={onStartSelection}
        onToggleSelected={onToggleSelected}
        onShowParticipantProfile={onShowParticipantProfile}
        selectionState={{
          isSelectionMode,
          selectedMessageIds,
        }}
        status={{
          hasOlderMessages,
          isInitialError: isMessageError,
          isInitialLoading: isLoadingMessages,
          isLoadingOlderMessages,
          isOffline: !isOnline,
        }}
        typingUsers={activeTypingUsers}
      />
    </div>
  );
}

export function ConversationComposer({
  chatId,
  group,
  inputPlaceholder,
  isBlockedDirectChat,
  isCompleted,
  isMessageSelectionMode,
  selectedMessages,
  sendError,
  onClearSelection,
  onClearSendError,
  onCreateProposal,
  onSendMessage,
}: ConversationComposerProps) {
  if (isMessageSelectionMode) {
    return (
      <MessageSelectionToolbar
        selectedMessages={selectedMessages}
        onClearSelection={onClearSelection}
      />
    );
  }

  const input = (
    <UnifiedMessageInput
      chatId={chatId}
      errorMessage={sendError}
      disabled={isBlockedDirectChat}
      onSend={onSendMessage}
      onClearError={onClearSendError}
      onCreateProposal={onCreateProposal}
      placeholder={inputPlaceholder}
    />
  );

  if (isCompleted && group?.plan) {
    return <CompletedReviewGate group={group}>{input}</CompletedReviewGate>;
  }

  return input;
}

function ConversationMessageErrorBanner({
  onRetry,
}: {
  onRetry?: () => Promise<void> | void;
}) {
  return (
    <Notice
      role="status"
      tone="warning"
      size="xs"
      icon={
        <AlertTriangle
          aria-hidden="true"
          className="size-4 shrink-0 text-accent"
        />
      }
      iconClassName="mt-0"
      action={
        onRetry ? (
          <Button
            className="h-7 shrink-0 px-2"
            size="xs"
            variant="accentGhost"
            onClick={() => void onRetry()}
          >
            <RefreshCw size={13} />
            Retry
          </Button>
        ) : null
      }
      className="items-center rounded-none border-accent/20 border-x-0 border-t-0 bg-accent/10 px-4 py-2 text-accent"
      contentClassName="font-medium"
    >
      <span className="block truncate">
        Some messages did not load. Retry to refresh this thread.
      </span>
    </Notice>
  );
}

function ConversationOfflineBanner() {
  return (
    <OfflineNotice
      size="xs"
      iconClassName="mt-0"
      className="items-center rounded-none border-accent/20 border-x-0 border-t-0 bg-accent/10 px-4 py-2 text-accent"
      contentClassName="font-medium"
    >
      <span>
        <span className="font-black text-accent">Offline.</span> Cached messages
        stay visible; new updates resume when you reconnect.
      </span>
    </OfflineNotice>
  );
}
