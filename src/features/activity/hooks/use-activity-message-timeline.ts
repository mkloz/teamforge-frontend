import { getTimelineResumeRefetchResetKey } from "@/features/activity/hooks/use-activity-message-timeline/read-state";
import {
  useTimelineMessagesProjection,
  useTimelineUnreadProjection,
} from "@/features/activity/hooks/use-activity-message-timeline/timeline-projection";
import type { UseActivityMessageTimelineInput } from "@/features/activity/hooks/use-activity-message-timeline/types";
import { useActivityMessageTimelineQueries } from "@/features/activity/hooks/use-activity-message-timeline/use-timeline-queries";
import {
  useFirstUnreadMessageId,
  useMarkLatestMessageRead,
  useTimelineResumeRefetch,
} from "@/features/activity/hooks/use-activity-message-timeline-effects";

export function useActivityMessageTimeline({
  chatId,
  currentUserId,
  proposalMessages,
  selectedKind,
  selectedParticipants,
}: UseActivityMessageTimelineInput) {
  const {
    canLoadTimeline,
    chatsQuery,
    isMessageTimelineError,
    isMessageTimelineLoading,
    messagesQuery,
  } = useActivityMessageTimelineQueries({
    chatId,
    currentUserId,
    selectedParticipantCount: selectedParticipants.length,
  });
  const {
    flattenedMessages,
    selectedDirectMessages,
    selectedGroupMessages,
    selectedTimelineMessages,
  } = useTimelineMessagesProjection({
    currentUserId,
    messagesData: messagesQuery.data,
    proposalMessages,
    selectedKind,
    selectedParticipants,
  });
  const { chatSummary, computedFirstUnreadMessageId } =
    useTimelineUnreadProjection({
      chatId,
      chats: chatsQuery.data,
      currentUserId,
      selectedTimelineMessages,
    });

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
