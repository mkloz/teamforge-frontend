import { NotificationsCache } from "@/features/notifications/api/notifications-cache";

import type { NotificationQueries } from "./notification-queries";

type NotificationItems = NonNullable<NotificationQueries["list"]["data"]>;

export function getUnreadNotificationItems(
  queries: NotificationQueries,
  items: NotificationItems,
) {
  return queries.unreadItems.data ?? items.filter((item) => !item.isRead);
}

export function getUnreadNotificationCount(
  queries: NotificationQueries,
  items: NotificationItems,
) {
  return (
    queries.unreadCount.data ??
    queries.unreadItems.data?.length ??
    NotificationsCache.countUnread(items)
  );
}

export function getIsRefreshingNotifications(queries: NotificationQueries) {
  return (
    queries.list.isFetching ||
    queries.unreadItems.isFetching ||
    queries.unreadCount.isFetching
  );
}

export function refreshNotificationQueries(queries: NotificationQueries) {
  return Promise.all([
    queries.list.refetch(),
    queries.unreadItems.refetch(),
    queries.unreadCount.refetch(),
  ]);
}
