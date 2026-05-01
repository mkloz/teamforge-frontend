import { appQueryClient } from "@/shared/api/query-client";
import type { Notification } from "@/shared/schemas";

import {
  NOTIFICATIONS_QUERY_KEY,
  NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
} from "@/features/notifications/api/notifications-query-keys";

export interface NotificationsCacheSnapshot {
  previousItems: Notification[] | undefined;
  previousCount: number | undefined;
}

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

function getNotificationVersion(notification: Notification) {
  return notification.version ?? new Date(notification.updatedAt).getTime();
}

function mergeNotifications(
  current: Notification[] | undefined,
  incoming: Notification,
) {
  const existingNotification = current?.find((item) => item.id === incoming.id);
  const shouldReplaceExisting =
    !existingNotification ||
    getNotificationVersion(incoming) >=
      getNotificationVersion(existingNotification);

  if (!shouldReplaceExisting) {
    return current ?? [];
  }

  const withoutExisting =
    current?.filter((item) => item.id !== incoming.id) ?? [];

  return [incoming, ...withoutExisting].sort(
    (left, right) =>
      getNotificationVersion(right) - getNotificationVersion(left),
  );
}

export const NotificationsCache = {
  async cancelQueries() {
    await Promise.all([
      appQueryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
      appQueryClient.cancelQueries({
        queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
      }),
    ]);
  },

  invalidateQueries() {
    return Promise.all([
      appQueryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
      appQueryClient.invalidateQueries({
        queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
      }),
    ]);
  },

  snapshot(): NotificationsCacheSnapshot {
    return {
      previousItems: appQueryClient.getQueryData<Notification[]>(
        NOTIFICATIONS_QUERY_KEY,
      ),
      previousCount: appQueryClient.getQueryData<number>(
        NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
      ),
    };
  },

  restore(snapshot: NotificationsCacheSnapshot | undefined) {
    if (snapshot?.previousItems) {
      appQueryClient.setQueryData(
        NOTIFICATIONS_QUERY_KEY,
        snapshot.previousItems,
      );
    }

    if (typeof snapshot?.previousCount === "number") {
      appQueryClient.setQueryData(
        NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
        snapshot.previousCount,
      );
    }
  },

  optimisticallyMarkRead(id: string) {
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
  },

  optimisticallyMarkAllRead() {
    updateNotificationsQuery((items) =>
      items.map((item) => ({
        ...item,
        isRead: true,
      })),
    );

    appQueryClient.setQueryData(NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY, 0);
  },

  setUnreadCount(count: number) {
    appQueryClient.setQueryData(NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY, count);
  },

  countUnread(items: Notification[]) {
    return items.reduce((count, item) => count + Number(!item.isRead), 0);
  },

  shouldReplaceCachedNotification(notification: Notification) {
    const existingNotification = appQueryClient
      .getQueryData<Notification[] | undefined>(NOTIFICATIONS_QUERY_KEY)
      ?.find((item) => item.id === notification.id);

    return (
      !existingNotification ||
      getNotificationVersion(notification) >=
        getNotificationVersion(existingNotification)
    );
  },

  applyNotificationUpdate(notification: Notification) {
    const existingNotification = appQueryClient
      .getQueryData<Notification[] | undefined>(NOTIFICATIONS_QUERY_KEY)
      ?.find((item) => item.id === notification.id);
    const didTransitionToRead =
      notification.isRead &&
      existingNotification &&
      !existingNotification.isRead;
    const didTransitionToUnread =
      !notification.isRead &&
      (!existingNotification || existingNotification.isRead);

    updateNotificationsQuery((items) =>
      mergeNotifications(items, notification),
    );

    if (didTransitionToRead) {
      updateUnreadCountQuery((count) => Math.max(0, count - 1));
    }

    if (didTransitionToUnread) {
      updateUnreadCountQuery((count) => count + 1);
    }
  },
};
