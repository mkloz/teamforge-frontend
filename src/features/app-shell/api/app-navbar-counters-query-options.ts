import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import {
  chatApiSchema,
  createPaginatedSchema,
  notificationUnreadCountSchema,
} from "@/shared/schemas";

const navbarChatsSchema = createPaginatedSchema(chatApiSchema);
const NAVBAR_CHATS_LIMIT = 100;
const NAVBAR_COUNTERS_STALE_TIME = 30_000;

export async function getChatsForNavbarCounters() {
  const response = await apiClient
    .get("chats/activity-feed", {
      searchParams: {
        limit: String(NAVBAR_CHATS_LIMIT),
      },
    })
    .json<unknown>();

  return navbarChatsSchema.parse(response).items;
}

export async function getUnreadNotificationCount() {
  const response = await apiClient
    .get("notifications/unread-count")
    .json<unknown>();

  return notificationUnreadCountSchema.parse(response).unreadCount;
}

export const AppNavbarCountersQueryOptions = {
  chats() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.activity.chats,
      queryFn: getChatsForNavbarCounters,
      staleTime: NAVBAR_COUNTERS_STALE_TIME,
    });
  },

  notificationUnreadCount() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.notifications.unreadCount,
      queryFn: getUnreadNotificationCount,
      staleTime: NAVBAR_COUNTERS_STALE_TIME,
    });
  },
};
