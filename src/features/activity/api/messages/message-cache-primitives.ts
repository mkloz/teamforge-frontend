import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

import type { ActivityMessagesInfiniteData } from "./message-cache-types";

export function getMessageCaches(chatId: string) {
  return appQueryClient.getQueriesData<ActivityMessagesInfiniteData>({
    queryKey: APP_QUERY_KEYS.activity.messages(chatId),
  });
}

export function updateMessagesCache(
  chatId: string,
  updater: (
    data: ActivityMessagesInfiniteData | undefined,
  ) => ActivityMessagesInfiniteData | undefined,
) {
  appQueryClient.setQueriesData<ActivityMessagesInfiniteData>(
    {
      queryKey: APP_QUERY_KEYS.activity.messages(chatId),
    },
    (current) => updater(current),
  );
}
