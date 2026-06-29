import type { RefObject } from "react";
import { useRef, useState } from "react";
import { PlanChangeDialog } from "@/features/activity/components/groups/group-detail-panel/plan-section/plan-change-dialog";
import { useActivityMessageActions } from "@/features/activity/hooks/use-activity-message-actions";
import {
  type UseConversationDataProps,
  useConversationData,
} from "@/features/activity/hooks/use-conversation-data";
import type {
  ActivityParticipant,
  ActivitySendMessageInput,
  DirectChat,
  Group,
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { ChatHeader } from "./chat-header";
import { ChatStatusBar } from "./chat-status-bar";
import {
  ConversationAlertBanners,
  ConversationComposer,
  ConversationMessageArea,
} from "./conversation-view-sections";
import {
  getConversationViewState,
  getSearchResultLabel,
} from "./conversation-view-state";
import { ChatBackground } from "./message-timeline/chat-background";
import type { MessageScrollHandle } from "./message-timeline/message-scroll.types";
import { useConversationMessageSearch } from "./use-conversation-message-search";
import { useConversationMessageSelection } from "./use-conversation-message-selection";

type ConversationWorkspaceProps =
  | (BaseConversationProps & { kind: "dm"; data: DirectChat })
  | (BaseConversationProps & { kind: "group"; data: Group });

interface BaseConversationProps {
  messages: UnifiedMessage[];
  hasOlderMessages?: boolean;
  isTyping?: boolean;
  firstUnreadMessageId?: string | null;
  isLoadingOlderMessages?: boolean;
  isMessageError?: boolean;
  isOnline?: boolean;
  typingUsers?: { name: string; avatar: string | null }[];
  isActionOpen?: boolean;
  openHeaderDetailsInPanel?: boolean;
  focusedMessageId?: string | null;
  isLoadingMessages?: boolean;
  messageScrollHandleRef?: RefObject<MessageScrollHandle | null>;
  sendError?: string | null;
  onBack: () => void;
  onClearSendError?: () => void;
  onLoadOlderMessages?: () => Promise<void> | void;
  onRetryMessages?: () => Promise<void> | void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  onToggleAction: () => void;
  onViewPlan?: () => void;
  onSendMessage: (input: ActivitySendMessageInput) => Promise<void> | void;
}

interface ConversationSearchState {
  conversationId: string | null;
  query: string;
}

/**
 * ConversationWorkspace - The flagship container for all conversations.
 * Consolidates Groups and Direct Chats into a single, high-performance UI.
 */
export function ConversationWorkspace(props: ConversationWorkspaceProps) {
  const {
    messages,
    isTyping = false,
    firstUnreadMessageId = null,
    typingUsers = [],
    isActionOpen = false,
    focusedMessageId,
    isLoadingMessages = false,
    isMessageError = false,
    isOnline = true,
    messageScrollHandleRef,
    openHeaderDetailsInPanel = false,
    sendError = null,
    hasOlderMessages = false,
    isLoadingOlderMessages = false,
    onBack,
    onClearSendError,
    onLoadOlderMessages,
    onRetryMessages,
    onShowParticipantProfile,
    onToggleAction,
    onViewPlan,
    onSendMessage,
  } = props;
  const { kind } = props;
  const {
    activePlan,
    allPinnedMessages,
    chatId,
    conversationId,
    inputPlaceholder,
    isBlockedDirectChat,
    isNotesChat,
  } = getConversationViewState(props);
  const [searchState, setSearchState] = useState<ConversationSearchState>({
    conversationId,
    query: "",
  });
  const searchQuery = getActiveConversationSearchQuery(
    searchState,
    conversationId,
  );
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const internalMessageScrollHandleRef = useRef<MessageScrollHandle | null>(
    null,
  );
  const activeMessageScrollHandleRef =
    messageScrollHandleRef ?? internalMessageScrollHandleRef;

  const { unpinMessage } = useActivityMessageActions();

  const conversationData = useConversationData(
    getConversationDataProps(props, isTyping, typingUsers),
  );

  const { headerProps, activeTypingUsers, typingText, isCompleted } =
    conversationData;
  const {
    activeMatchIndex,
    goToNextMatch,
    goToPreviousMatch,
    isSearching,
    matchCount,
    normalizedQuery,
  } = useConversationMessageSearch({
    chatId,
    hasOlderMessages,
    isLoadingOlderMessages,
    messages,
    messageScrollHandleRef: activeMessageScrollHandleRef,
    onLoadOlderMessages,
    query: searchQuery,
  });

  const {
    clearMessageSelection,
    isMessageSelectionMode,
    selectedMessageIds,
    selectedMessages,
    startMessageSelection,
    toggleMessageSelection,
  } = useConversationMessageSelection({ conversationId, messages });

  const searchResultLabel = getSearchResultLabel({
    activeMatchIndex,
    isSearching,
    matchCount,
    normalizedQuery,
  });
  const handleCreateProposal = canOpenPlanProposalDialog(
    kind,
    activePlan,
    isCompleted,
  )
    ? createOpenProposalDialogHandler(setIsProposalDialogOpen)
    : undefined;
  const handleUnpinPinnedMessage = createPinnedMessageUnpinHandler({
    allPinnedMessages,
    unpinMessage,
  });
  const handleActivatePinnedMessage = (messageId: string) => {
    activeMessageScrollHandleRef.current?.scrollToMessage(messageId, {
      highlight: true,
    });
  };
  const handleSearchQueryChange = (query: string) =>
    setSearchState(getNextConversationSearchState(conversationId, query));

  return (
    <div
      data-chat-dropzone-root
      className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas/40"
    >
      <ChatBackground />

      <ConversationPlanProposalDialog
        activePlan={activePlan}
        isCompleted={isCompleted}
        isOpen={isProposalDialogOpen}
        onOpenChange={setIsProposalDialogOpen}
      />

      <ChatHeader
        kind={kind}
        title={headerProps.title}
        subtitle={headerProps.subtitle}
        avatarUrl={headerProps.avatarUrl}
        avatarKind={getHeaderAvatarKind(isNotesChat)}
        detailsNavigation={getHeaderDetailsNavigation(
          openHeaderDetailsInPanel,
          headerProps.detailsNavigation,
        )}
        onlineStatus={headerProps.onlineStatus}
        isTyping={activeTypingUsers.length > 0}
        typingText={typingText}
        isActionOpen={isActionOpen}
        searchQuery={searchQuery}
        searchResultLabel={searchResultLabel}
        isSearchNavigationDisabled={matchCount === 0}
        showAction={!isNotesChat}
        onBack={onBack}
        onSearchQueryChange={handleSearchQueryChange}
        onSearchNext={goToNextMatch}
        onSearchPrevious={goToPreviousMatch}
        onToggleAction={getHeaderToggleHandler(isNotesChat, onToggleAction)}
      />

      <ChatStatusBar
        plan={getConversationStatusBarPlan(props)}
        pinnedMessages={allPinnedMessages}
        onViewDetails={getStatusBarDetailsHandler({
          isNotesChat,
          onToggleAction,
          onViewPlan,
        })}
        onUnpinPinnedMessage={handleUnpinPinnedMessage}
        onActivatePinnedMessage={handleActivatePinnedMessage}
      />

      <ConversationAlertBanners
        isMessageError={isMessageError}
        isOnline={isOnline}
        messageCount={messages.length}
        onRetryMessages={onRetryMessages}
      />

      {/* Message area */}
      <ConversationMessageArea
        activeTypingUsers={activeTypingUsers}
        activeMessageScrollHandleRef={activeMessageScrollHandleRef}
        conversationId={conversationId}
        firstUnreadMessageId={firstUnreadMessageId}
        focusedMessageId={focusedMessageId}
        kind={kind}
        messageListStatus={{
          hasOlderMessages,
          isLoadingMessages,
          isLoadingOlderMessages,
          isMessageError,
          isNotesChat,
          isOnline,
        }}
        messages={messages}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        normalizedQuery={normalizedQuery}
        selectionState={{
          isSelectionMode: isMessageSelectionMode,
          selectedMessageIds,
        }}
        onLoadOlderMessages={onLoadOlderMessages}
        onRetryMessages={onRetryMessages}
        onShowParticipantProfile={onShowParticipantProfile}
        onStartSelection={startMessageSelection}
        onToggleSelected={toggleMessageSelection}
      />

      {/* Input area */}
      <ConversationComposer
        chatId={chatId}
        group={getConversationComposerGroup(props)}
        inputPlaceholder={inputPlaceholder}
        isBlockedDirectChat={isBlockedDirectChat}
        isCompleted={isCompleted}
        isMessageSelectionMode={isMessageSelectionMode}
        selectedMessages={selectedMessages}
        sendError={sendError}
        onClearSelection={clearMessageSelection}
        onClearSendError={onClearSendError}
        onCreateProposal={handleCreateProposal}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}

function getActiveConversationSearchQuery(
  searchState: ConversationSearchState,
  conversationId: string | null,
) {
  return searchState.conversationId === conversationId ? searchState.query : "";
}

function getNextConversationSearchState(
  conversationId: string | null,
  query: string,
): ConversationSearchState {
  return { conversationId, query };
}

function ConversationPlanProposalDialog({
  activePlan,
  isCompleted,
  isOpen,
  onOpenChange,
}: {
  activePlan?: Plan | null;
  isCompleted: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  if (!canShowPlanProposalDialog(activePlan, isCompleted)) {
    return null;
  }

  return (
    <PlanChangeDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      plan={activePlan}
      trigger={null}
    />
  );
}

function canShowPlanProposalDialog(
  activePlan: Plan | null | undefined,
  isCompleted: boolean,
): activePlan is Plan {
  return Boolean(activePlan && !isCompleted);
}

function canOpenPlanProposalDialog(
  kind: ConversationWorkspaceProps["kind"],
  activePlan: Plan | null | undefined,
  isCompleted: boolean,
) {
  return kind === "group" && canShowPlanProposalDialog(activePlan, isCompleted);
}

function createOpenProposalDialogHandler(
  setIsProposalDialogOpen: (isOpen: boolean) => void,
) {
  return () => setIsProposalDialogOpen(true);
}

function getConversationDataProps(
  props: ConversationWorkspaceProps,
  isTyping: boolean,
  typingUsers: { name: string; avatar: string | null }[],
): UseConversationDataProps {
  if (props.kind === "group") {
    return { kind: props.kind, data: props.data, isTyping, typingUsers };
  }

  return { kind: props.kind, data: props.data, isTyping, typingUsers };
}

function getHeaderAvatarKind(isNotesChat: boolean) {
  return isNotesChat ? "notes" : "default";
}

function getHeaderDetailsNavigation<T>(
  openHeaderDetailsInPanel: boolean,
  detailsNavigation: T,
) {
  return openHeaderDetailsInPanel ? undefined : detailsNavigation;
}

function getHeaderToggleHandler(
  isNotesChat: boolean,
  onToggleAction: () => void,
) {
  return isNotesChat ? noop : onToggleAction;
}

function getConversationStatusBarPlan(
  props: ConversationWorkspaceProps,
): Plan | undefined {
  return props.kind === "group" ? (props.data.plan ?? undefined) : undefined;
}

function getStatusBarDetailsHandler({
  isNotesChat,
  onToggleAction,
  onViewPlan,
}: {
  isNotesChat: boolean;
  onToggleAction: () => void;
  onViewPlan?: () => void;
}) {
  return isNotesChat ? noop : (onViewPlan ?? onToggleAction);
}

function createPinnedMessageUnpinHandler({
  allPinnedMessages,
  unpinMessage,
}: {
  allPinnedMessages: UnifiedMessage[];
  unpinMessage: (message: UnifiedMessage) => Promise<void> | void;
}) {
  return (messageId: string) => {
    const targetMessage = allPinnedMessages.find(
      (message) => message.id === messageId,
    );

    if (!targetMessage) {
      return;
    }

    void unpinMessage(targetMessage);
  };
}

function getConversationComposerGroup(
  props: ConversationWorkspaceProps,
): Group | null {
  return props.kind === "group" ? props.data : null;
}

const noop = () => {};
