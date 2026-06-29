import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { ActivityQueryFactory } from "@/features/activity/public/activity-query-factory";
import type { ActivityKind } from "@/shared/navigation/activity-navigation";
import {
  canLoadMessageTimeline,
  getFirstUnreadMessageId,
  getMessageTimelineQueryState,
  getSelectedDirectMessages,
  getSelectedGroupMessages,
  getSelectedTimelineMessages,
} from "./activity-message-timeline-state";
import {
  useFirstUnreadMessageId,
  useMarkLatestMessageRead,
  useTimelineResumeRefetch,
} from "./use-activity-message-timeline-effects";

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
  const canLoadTimeline = canLoadMessageTimeline({
    chatId,
    currentUserId,
    selectedParticipantCount: selectedParticipants.length,
  });
  const messagesQuery = useInfiniteQuery({
    ...ActivityQueryFactory.conversationMessages(chatId ?? "__missing__"),
    enabled: canLoadTimeline,
  });
  const { isMessageTimelineError, isMessageTimelineLoading } =
    getMessageTimelineQueryState({
      canLoadTimeline,
      hasMessageData: Boolean(messagesQuery.data),
      isError: messagesQuery.isError,
      isLoading: messagesQuery.isLoading,
    });

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
  const selectedGroupMessages = useMemo(
    () =>
      getSelectedGroupMessages({
        flattenedMessages,
        proposalMessages,
        selectedKind,
      }),
    [flattenedMessages, proposalMessages, selectedKind],
  );
  const selectedDirectMessages = useMemo(
    () =>
      getSelectedDirectMessages({
        flattenedMessages,
        selectedKind,
      }),
    [flattenedMessages, selectedKind],
  );
  const selectedTimelineMessages = useMemo(
    () =>
      getSelectedTimelineMessages(
        selectedKind,
        selectedGroupMessages,
        selectedDirectMessages,
      ),
    [selectedDirectMessages, selectedGroupMessages, selectedKind],
  );
  const chatSummary = useMemo(
    () => chatsQuery.data?.find((chat) => chat.id === chatId) ?? null,
    [chatId, chatsQuery.data],
  );
  const computedFirstUnreadMessageId = useMemo(
    () =>
      getFirstUnreadMessageId({
        chatSummary,
        currentUserId,
        messages: selectedTimelineMessages,
      }),
    [chatSummary, currentUserId, selectedTimelineMessages],
  );

  const latestReadableMessageId =
    flattenedMessages[flattenedMessages.length - 1]?.id ?? null;
  const firstUnreadMessageId = useFirstUnreadMessageId({
    chatId,
    computedFirstUnreadMessageId,
  });

  useTimelineResumeRefetch({
    canLoadTimeline,
    isFetching: messagesQuery.isFetching,
    refetch: messagesQuery.refetch,
    resetKey: getTimelineResumeRefetchResetKey(
      chatId,
      currentUserId,
      selectedParticipants.length,
    ),
  });

  useMarkLatestMessageRead({
    chatId,
    chatSummary,
    latestReadableMessageId,
  });

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
    firstUnreadMessageId,
    hasOlderMessages: messagesQuery.hasNextPage,
    isMessageTimelineLoading,
    isMessageTimelineError,
    isLoadingOlderMessages: messagesQuery.isFetchingNextPage,
    loadOlderMessages,
    retryMessageTimeline,
  };
}

function getTimelineResumeRefetchResetKey(
  chatId: string | null,
  currentUserId: string | null,
  selectedParticipantCount: number,
) {
  return `${chatId ?? ""}:${currentUserId ?? ""}:${selectedParticipantCount}`;
}
