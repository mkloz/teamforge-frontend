import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { activityQueries } from "@/features/activity/api/activity-queries";
import {
  canLoadMessageTimeline,
  getMessageTimelineQueryState,
} from "@/features/activity/hooks/activity-message-timeline-state";
import type { UseActivityMessageTimelineQueriesInput } from "@/features/activity/hooks/use-activity-message-timeline/types";

export function useActivityMessageTimelineQueries({
  chatId,
  currentUserId,
  selectedParticipantCount,
}: UseActivityMessageTimelineQueriesInput) {
  const chatsQuery = useQuery(activityQueries.chats());
  const canLoadTimeline = canLoadMessageTimeline({
    chatId,
    currentUserId,
    selectedParticipantCount,
  });
  const messagesQuery = useInfiniteQuery({
    ...activityQueries.conversationMessages(chatId ?? "__missing__"),
    enabled: canLoadTimeline,
  });
  const { isMessageTimelineError, isMessageTimelineLoading } =
    getMessageTimelineQueryState({
      canLoadTimeline,
      hasMessageData: Boolean(messagesQuery.data),
      isError: messagesQuery.isError,
      isLoading: messagesQuery.isLoading,
    });

  return {
    canLoadTimeline,
    chatsQuery,
    isMessageTimelineError,
    isMessageTimelineLoading,
    messagesQuery,
  };
}
