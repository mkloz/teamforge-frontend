import { infiniteQueryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import { ActivityApi } from "@/features/activity/api/activity.api";
import {
  DEFAULT_ACTIVITY_MESSAGE_LIMIT,
  type ActivityMessagesPageData,
} from "@/features/activity/api/messages/message-cache-types";

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
