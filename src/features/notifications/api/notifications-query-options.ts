import { queryOptions } from "@tanstack/react-query";

import { NotificationsApi } from "@/features/notifications/api/notifications.api";
import {
  NOTIFICATIONS_QUERY_KEY,
  NOTIFICATIONS_UNREAD_QUERY_KEY,
  NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
} from "@/features/notifications/api/notifications-query-keys";

export const NotificationsQueryOptions = {
  list() {
    return queryOptions({
      queryKey: NOTIFICATIONS_QUERY_KEY,
      queryFn: () => NotificationsApi.getNotifications(),
      staleTime: 30_000,
    });
  },

  unreadCount() {
    return queryOptions({
      queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
      queryFn: () => NotificationsApi.getUnreadCount(),
      staleTime: 30_000,
    });
  },

  unreadList() {
    return queryOptions({
      queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
      queryFn: () =>
        NotificationsApi.getNotifications({
          isRead: false,
          limit: 100,
        }),
      staleTime: 30_000,
    });
  },
};
