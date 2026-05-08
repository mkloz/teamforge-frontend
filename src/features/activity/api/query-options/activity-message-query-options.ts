import { infiniteQueryOptions } from "@tanstack/react-query";
import { ActivityApi } from "@/features/activity/api/activity.api";
import {
  type ActivityMessagesPageData,
  DEFAULT_ACTIVITY_MESSAGE_LIMIT,
} from "@/features/activity/api/messages/message-cache-types";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

export function conversationMessagesQueryOptions(chatId: string) {
  return infiniteQueryOptions({
    queryKey: APP_QUERY_KEYS.activity.conversationMessages(chatId),
    initialPageParam: 1,
    staleTime: 30_000,
    queryFn: async ({ pageParam }): Promise<ActivityMessagesPageData> => {
      return ActivityApi.getChatMessages(chatId, {
        limit: DEFAULT_ACTIVITY_MESSAGE_LIMIT,
        page: pageParam,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.currentPage < lastPage.meta.totalPages
        ? lastPage.meta.currentPage + 1
        : undefined,
  });
}
