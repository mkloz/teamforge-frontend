import { queryOptions } from "@tanstack/react-query";

import { appQueryClient } from "@/shared/api/query-client";
import type { Notification } from "@/shared/schemas";

import { NotificationsApi } from "./notifications.api";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;
export const NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY = [
  "notifications",
  "unread-count",
] as const;

function updateNotificationsQuery(
  updater: (items: Notification[]) => Notification[],
) {
  appQueryClient.setQueryData<Notification[] | undefined>(
    NOTIFICATIONS_QUERY_KEY,
    (current) => (current ? updater(current) : current),
  );
}

function updateUnreadCountQuery(updater: (count: number) => number) {
  appQueryClient.setQueryData<number | undefined>(
    NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
    (current) => (typeof current === "number" ? updater(current) : current),
  );
}

export class NotificationsQueries {
  static list() {
    return queryOptions({
      queryKey: NOTIFICATIONS_QUERY_KEY,
      queryFn: () => NotificationsApi.getNotifications(),
      staleTime: 30_000,
    });
  }

  static unreadCount() {
    return queryOptions({
      queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
      queryFn: () => NotificationsApi.getUnreadCount(),
      staleTime: 30_000,
    });
  }

  static markRead(id: string) {
    return NotificationsApi.markRead(id);
  }

  static markAllRead() {
    return NotificationsApi.markAllRead();
  }

  static optimisticallyMarkRead(id: string) {
    let unreadDelta = 0;

    updateNotificationsQuery((items) =>
      items.map((item) => {
        if (item.id !== id || item.isRead) {
          return item;
        }

        unreadDelta = 1;

        return {
          ...item,
          isRead: true,
        };
      }),
    );

    if (unreadDelta > 0) {
      updateUnreadCountQuery((count) => Math.max(0, count - unreadDelta));
    }
  }

  static optimisticallyMarkAllRead() {
    updateNotificationsQuery((items) =>
      items.map((item) => ({
        ...item,
        isRead: true,
      })),
    );

    appQueryClient.setQueryData(NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY, 0);
  }

  static countUnread(items: Notification[]) {
    return items.reduce((count, item) => count + Number(!item.isRead), 0);
  }
}
