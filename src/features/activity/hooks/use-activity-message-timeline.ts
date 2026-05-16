import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";

import { ActivityCommands } from "@/features/activity/api/activity-commands";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type { ActivityKind } from "@/features/activity/lib/activity-route";

interface UseActivityMessageTimelineInput {
  chatId: string | null;
  currentUserId: string | null;
  proposalMessages: UnifiedMessage[];
  selectedKind: ActivityKind | null;
  selectedParticipants: ActivityParticipant[];
}

export function useActivityMessageTimeline({
  chatId,
  currentUserId,
  proposalMessages,
  selectedKind,
  selectedParticipants,
}: UseActivityMessageTimelineInput) {
  const chatsQuery = useQuery(ActivityQueryFactory.chats());
  const messagesQuery = useInfiniteQuery({
    ...ActivityQueryFactory.conversationMessages(chatId ?? "__missing__"),
    enabled:
      !!chatId && selectedParticipants.length > 0 && currentUserId !== null,
  });
  const isMessageTimelineLoading =
    !!chatId &&
    selectedParticipants.length > 0 &&
    currentUserId !== null &&
    messagesQuery.isLoading &&
    !messagesQuery.data;
  const isMessageTimelineError =
    !!chatId &&
    selectedParticipants.length > 0 &&
    currentUserId !== null &&
    messagesQuery.isError &&
    !messagesQuery.data;

  const flattenedApiMessages = useMemo(
    () => ActivityQueryFactory.flattenMessagePages(messagesQuery.data),
    [messagesQuery.data],
  );
  const flattenedMessages = useMemo(
    () =>
      ActivityQueryFactory.mapMessages(
        flattenedApiMessages,
        selectedParticipants,
        currentUserId,
      ),
    [currentUserId, flattenedApiMessages, selectedParticipants],
  );
  const selectedGroupMessages = useMemo(() => {
    if (selectedKind !== "group") {
      return [];
    }

    const reconciledTimeline = reconcileProposalMessagesWithChatMessages(
      flattenedMessages,
      proposalMessages,
    );

    return ActivityQueryFactory.buildConversationTimeline(
      reconciledTimeline.messages,
      reconciledTimeline.proposalMessages,
    );
  }, [flattenedMessages, proposalMessages, selectedKind]);
  const selectedDirectMessages = useMemo(
    () => (selectedKind === "dm" ? flattenedMessages : []),
    [flattenedMessages, selectedKind],
  );

  const latestReadableMessageId =
    flattenedMessages[flattenedMessages.length - 1]?.id ?? null;
  const lastMarkedReadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chatId || !latestReadableMessageId || !chatsQuery.data) {
      return;
    }

    const chatSummary = chatsQuery.data.find((chat) => chat.id === chatId);

    if (!chatSummary || (chatSummary.unreadCount ?? 0) === 0) {
      return;
    }

    if (lastMarkedReadRef.current === latestReadableMessageId) {
      return;
    }

    lastMarkedReadRef.current = latestReadableMessageId;
    void ActivityCommands.markChatRead(chatId, latestReadableMessageId);
  }, [chatId, chatsQuery.data, latestReadableMessageId]);

  async function loadOlderMessages() {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      await messagesQuery.fetchNextPage();
    }
  }

  async function retryMessageTimeline() {
    await messagesQuery.refetch();
  }

  return {
    selectedGroupMessages,
    selectedDirectMessages,
    hasOlderMessages: messagesQuery.hasNextPage,
    isMessageTimelineLoading,
    isMessageTimelineError,
    isLoadingOlderMessages: messagesQuery.isFetchingNextPage,
    loadOlderMessages,
    retryMessageTimeline,
  };
}

function reconcileProposalMessagesWithChatMessages(
  messages: UnifiedMessage[],
  proposalMessages: UnifiedMessage[],
) {
  if (proposalMessages.length === 0 || messages.length === 0) {
    return { messages, proposalMessages };
  }

  const remainingMessages = [...messages];
  const reconciledProposalMessages = proposalMessages.map((proposalMessage) => {
    const backingMessageIndex = remainingMessages.findIndex((message) =>
      isProposalBackingMessage(message, proposalMessage),
    );

    if (backingMessageIndex < 0) {
      return proposalMessage;
    }

    const backingMessage = remainingMessages[backingMessageIndex];

    remainingMessages.splice(backingMessageIndex, 1);

    return {
      ...proposalMessage,
      attachments: backingMessage.attachments,
      chatId: backingMessage.chatId,
      createdAt: backingMessage.createdAt,
      deletedAt: backingMessage.deletedAt,
      editedAt: backingMessage.editedAt,
      forwardedFromChatId: backingMessage.forwardedFromChatId,
      forwardedFromMessageId: backingMessage.forwardedFromMessageId,
      forwardedFromSenderId: backingMessage.forwardedFromSenderId,
      forwardedFromSenderName: backingMessage.forwardedFromSenderName,
      id: backingMessage.id,
      isEdited: backingMessage.isEdited,
      isPinned: backingMessage.isPinned,
      isSaved: backingMessage.isSaved,
      reactions: backingMessage.reactions,
      replyTo: backingMessage.replyTo,
      replyToId: backingMessage.replyToId,
      sender: backingMessage.sender,
      status: backingMessage.status,
      updatedAt: backingMessage.updatedAt,
      version: backingMessage.version,
    };
  });

  return {
    messages: remainingMessages,
    proposalMessages: reconciledProposalMessages,
  };
}

function isProposalBackingMessage(
  message: UnifiedMessage,
  proposalMessage: UnifiedMessage,
) {
  if (
    message.type !== "SYSTEM" ||
    message.chatId !== proposalMessage.chatId ||
    message.senderId !== proposalMessage.senderId ||
    normalizeTimelineContent(message.content) !==
      normalizeTimelineContent(proposalMessage.content)
  ) {
    return false;
  }

  const messageTime = new Date(message.createdAt).getTime();
  const proposalTime = new Date(proposalMessage.createdAt).getTime();

  if (Number.isNaN(messageTime) || Number.isNaN(proposalTime)) {
    return false;
  }

  return Math.abs(messageTime - proposalTime) <= 5 * 60 * 1000;
}

function normalizeTimelineContent(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/u, "");
}
