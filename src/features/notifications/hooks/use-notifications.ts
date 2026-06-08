import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { NotificationsCache } from "@/features/notifications/api/notifications-cache";
import { NotificationsCommands } from "@/features/notifications/api/notifications-commands";
import { NotificationsQueryFactory } from "@/features/notifications/api/notifications-query-factory";
import { groupNotificationsByRecency } from "@/features/notifications/lib/notification-groups";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

export function useUnreadNotifications() {
  const unreadItemsQuery = useQuery(NotificationsQueryFactory.unreadList());

  return {
    unreadItems: unreadItemsQuery.data ?? [],
    isLoading: unreadItemsQuery.isLoading,
  };
}

interface UseNotificationsOptions {
  enabled?: boolean;
}

export function useNotifications({
  enabled = true,
}: UseNotificationsOptions = {}) {
  const listQuery = useQuery({
    ...NotificationsQueryFactory.list(),
    enabled,
  });
  const unreadItemsQuery = useQuery({
    ...NotificationsQueryFactory.unreadList(),
    enabled,
  });
  const unreadCountQuery = useQuery({
    ...NotificationsQueryFactory.unreadCount(),
    enabled,
  });
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const items = listQuery.data ?? [];
  const unreadItems =
    unreadItemsQuery.data ?? items.filter((item) => !item.isRead);
  const [referenceTime] = useState(() => Date.now());

  const markReadMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't update that notification right now.",
    },
    mutationKey: ["notifications", "mark-read"],
    mutationFn: (id: string) => NotificationsCommands.markRead(id),
    onMutate: async (id) => {
      await NotificationsCache.cancelQueries();

      const snapshot = NotificationsCache.snapshot();
      NotificationsCache.optimisticallyMarkRead(id);

      return snapshot;
    },
    onSuccess: (notification) => {
      NotificationsCache.applyNotificationUpdate(notification);
    },
    onError: (_error, _id, snapshot) => {
      NotificationsCache.restore(snapshot);
    },
    onSettled: async () => {
      await NotificationsCache.invalidateQueries();
    },
  });

  const markUnreadMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't update that notification right now.",
    },
    mutationKey: ["notifications", "mark-unread"],
    mutationFn: (id: string) => NotificationsCommands.markUnread(id),
    onMutate: async (id) => {
      await NotificationsCache.cancelQueries();

      const snapshot = NotificationsCache.snapshot();
      NotificationsCache.optimisticallyMarkUnread(id);

      return snapshot;
    },
    onSuccess: (notification) => {
      NotificationsCache.applyNotificationUpdate(notification);
    },
    onError: (_error, _id, snapshot) => {
      NotificationsCache.restore(snapshot);
    },
    onSettled: async () => {
      await NotificationsCache.invalidateQueries();
    },
  });

  const markAllReadMutation = useMutation({
    meta: {
      errorToastMessage: "We couldn't update your notifications right now.",
    },
    mutationKey: ["notifications", "mark-all-read"],
    mutationFn: () => NotificationsCommands.markAllRead(),
    onMutate: async () => {
      await NotificationsCache.cancelQueries();

      const snapshot = NotificationsCache.snapshot();
      NotificationsCache.optimisticallyMarkAllRead();

      return snapshot;
    },
    onSuccess: () => {
      NotificationsCache.setUnreadCount(0);
    },
    onError: (_error, _variables, snapshot) => {
      NotificationsCache.restore(snapshot);
    },
    onSettled: async () => {
      await NotificationsCache.invalidateQueries();
    },
  });

  const count =
    unreadCountQuery.data ??
    unreadItemsQuery.data?.length ??
    NotificationsCache.countUnread(items);

  const notificationGroups = groupNotificationsByRecency(items, referenceTime);

  function guardReadStateAction(id: string, description: string) {
    return guardOfflineAction({
      id,
      description,
    });
  }

  function markRead(id: string) {
    if (
      guardReadStateAction(
        "notifications-mark-read-offline",
        "Reconnect before marking notifications as read.",
      )
    ) {
      return;
    }

    markReadMutation.mutate(id);
  }

  async function markReadAsync(id: string) {
    if (
      guardReadStateAction(
        "notifications-mark-read-offline",
        "Reconnect before marking notifications as read.",
      )
    ) {
      return null;
    }

    return markReadMutation.mutateAsync(id);
  }

  function markUnread(id: string) {
    if (
      guardReadStateAction(
        "notifications-mark-unread-offline",
        "Reconnect before marking notifications as unread.",
      )
    ) {
      return;
    }

    markUnreadMutation.mutate(id);
  }

  async function markUnreadAsync(id: string) {
    if (
      guardReadStateAction(
        "notifications-mark-unread-offline",
        "Reconnect before marking notifications as unread.",
      )
    ) {
      return null;
    }

    return markUnreadMutation.mutateAsync(id);
  }

  async function markAllReadAsync() {
    if (
      guardReadStateAction(
        "notifications-mark-all-read-offline",
        "Reconnect before clearing notification badges.",
      )
    ) {
      return null;
    }

    return markAllReadMutation.mutateAsync();
  }

  return {
    items,
    unreadItems,
    notificationGroups,
    count,
    isLoading: listQuery.isLoading && items.length === 0,
    isRefreshing:
      listQuery.isFetching ||
      unreadItemsQuery.isFetching ||
      unreadCountQuery.isFetching,
    isMarkingAllRead: markAllReadMutation.isPending,
    markRead,
    markReadAsync,
    markUnread,
    markUnreadAsync,
    markAllReadAsync,
    refreshNotifications: () =>
      Promise.all([
        listQuery.refetch(),
        unreadItemsQuery.refetch(),
        unreadCountQuery.refetch(),
      ]),
    isOnline,
  };
}
