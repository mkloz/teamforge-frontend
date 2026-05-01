import { queryOptions } from "@tanstack/react-query";

import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import {
  invalidateExploreFriendRequestSurfaces,
  invalidateFriendshipSurfaces,
  invalidateGroupMembershipSurfaces,
} from "@/shared/api/query-invalidation";
import { appQueryClient } from "@/shared/api/query-client";
import type { Notification } from "@/shared/schemas";

import { NotificationsApi } from "./notifications.api";
import {
  NOTIFICATIONS_QUERY_KEY,
  NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
} from "./notifications-query-keys";

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

  static applyNotificationUpdate(notification: Notification) {
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
  }

  static addIncomingNotification(notification: Notification) {
    const existingNotification = appQueryClient
      .getQueryData<Notification[] | undefined>(NOTIFICATIONS_QUERY_KEY)
      ?.find((item) => item.id === notification.id);
    const shouldReplaceExisting =
      !existingNotification ||
      getNotificationVersion(notification) >=
        getNotificationVersion(existingNotification);

    this.applyNotificationUpdate(notification);

    if (!shouldReplaceExisting) {
      return;
    }

    if (notification.type === "GROUP_INVITE") {
      void Promise.all([
        appQueryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.home.invitations,
        }),
        appQueryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.home.sentInvitations,
        }),
      ]);
    }

    if (
      notification.type === "GROUP_JOIN_APPROVED" ||
      notification.type === "GROUP_MEMBER_LEFT" ||
      notification.type === "GROUP_DISBANDED"
    ) {
      void invalidateGroupMembershipSurfaces();
    }

    if (notification.type === "FRIEND_REQUEST") {
      void invalidateExploreFriendRequestSurfaces();
    }

    if (notification.type === "FRIEND_ACCEPTED") {
      void Promise.all([
        invalidateExploreFriendRequestSurfaces(),
        invalidateFriendshipSurfaces(),
      ]);
    }
  }
}

export { NOTIFICATIONS_QUERY_KEY, NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY };
