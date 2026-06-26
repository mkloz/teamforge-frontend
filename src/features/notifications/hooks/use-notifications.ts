import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { NotificationsCache } from "@/features/notifications/api/notifications-cache";
import { NotificationsCommands } from "@/features/notifications/api/notifications-commands";
import { NotificationsQueryFactory } from "@/features/notifications/api/notifications-query-factory";
import { groupNotificationsByRecency } from "@/features/notifications/lib/notification-groups";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

interface UseNotificationsOptions {
  enabled?: boolean;
}

const NOTIFICATION_OFFLINE_ACTIONS = {
  markAllRead: {
    id: "notifications-mark-all-read-offline",
    description: "Reconnect before clearing notification badges.",
  },
  markRead: {
    id: "notifications-mark-read-offline",
    description: "Reconnect before marking notifications as read.",
  },
  markUnread: {
    id: "notifications-mark-unread-offline",
    description: "Reconnect before marking notifications as unread.",
  },
} as const;

type GuardOfflineAction = ReturnType<
  typeof useOfflineActionGuard
>["guardOfflineAction"];
type NotificationQueries = ReturnType<typeof useNotificationQueries>;
type NotificationMutations = ReturnType<typeof useNotificationMutations>;
type NotificationOfflineAction =
  (typeof NOTIFICATION_OFFLINE_ACTIONS)[keyof typeof NOTIFICATION_OFFLINE_ACTIONS];

export function useNotifications({
  enabled = true,
}: UseNotificationsOptions = {}) {
  const queries = useNotificationQueries(enabled);
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const [referenceTime] = useState(() => Date.now());
  const items = queries.list.data ?? [];
  const unreadItems = getUnreadNotificationItems(queries, items);
  const mutations = useNotificationMutations();
  const actions = createNotificationActions({
    guardOfflineAction,
    mutations,
  });

  return {
    items,
    unreadItems,
    notificationGroups: groupNotificationsByRecency(items, referenceTime),
    count: getUnreadNotificationCount(queries, items),
    isLoading: queries.list.isLoading && items.length === 0,
    isRefreshing: getIsRefreshingNotifications(queries),
    isMarkingAllRead: mutations.markAllRead.isPending,
    ...actions,
    refreshNotifications: () => refreshNotificationQueries(queries),
    isOnline,
  };
}

function useNotificationQueries(enabled: boolean) {
  const list = useQuery({
    ...NotificationsQueryFactory.list(),
    enabled,
  });
  const unreadItems = useQuery({
    ...NotificationsQueryFactory.unreadList(),
    enabled,
  });
  const unreadCount = useQuery({
    ...NotificationsQueryFactory.unreadCount(),
    enabled,
  });

  return {
    list,
    unreadCount,
    unreadItems,
  };
}

function useNotificationMutations() {
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

  return {
    markAllRead: markAllReadMutation,
    markRead: markReadMutation,
    markUnread: markUnreadMutation,
  };
}

function getUnreadNotificationItems(
  queries: NotificationQueries,
  items: NonNullable<NotificationQueries["list"]["data"]>,
) {
  return queries.unreadItems.data ?? items.filter((item) => !item.isRead);
}

function getUnreadNotificationCount(
  queries: NotificationQueries,
  items: NonNullable<NotificationQueries["list"]["data"]>,
) {
  return (
    queries.unreadCount.data ??
    queries.unreadItems.data?.length ??
    NotificationsCache.countUnread(items)
  );
}

function getIsRefreshingNotifications(queries: NotificationQueries) {
  return (
    queries.list.isFetching ||
    queries.unreadItems.isFetching ||
    queries.unreadCount.isFetching
  );
}

function createNotificationActions({
  guardOfflineAction,
  mutations,
}: {
  guardOfflineAction: GuardOfflineAction;
  mutations: NotificationMutations;
}) {
  function markRead(id: string) {
    if (shouldSkipNotificationAction(guardOfflineAction, "markRead")) {
      return;
    }

    mutations.markRead.mutate(id);
  }

  async function markReadAsync(id: string) {
    if (shouldSkipNotificationAction(guardOfflineAction, "markRead")) {
      return null;
    }

    return mutations.markRead.mutateAsync(id);
  }

  function markUnread(id: string) {
    if (shouldSkipNotificationAction(guardOfflineAction, "markUnread")) {
      return;
    }

    mutations.markUnread.mutate(id);
  }

  async function markUnreadAsync(id: string) {
    if (shouldSkipNotificationAction(guardOfflineAction, "markUnread")) {
      return null;
    }

    return mutations.markUnread.mutateAsync(id);
  }

  async function markAllReadAsync() {
    if (shouldSkipNotificationAction(guardOfflineAction, "markAllRead")) {
      return null;
    }

    return mutations.markAllRead.mutateAsync();
  }

  return {
    markRead,
    markReadAsync,
    markUnread,
    markUnreadAsync,
    markAllReadAsync,
  };
}

function shouldSkipNotificationAction(
  guardOfflineAction: GuardOfflineAction,
  action: keyof typeof NOTIFICATION_OFFLINE_ACTIONS,
) {
  return guardNotificationOfflineAction(
    guardOfflineAction,
    NOTIFICATION_OFFLINE_ACTIONS[action],
  );
}

function guardNotificationOfflineAction(
  guardOfflineAction: GuardOfflineAction,
  action: NotificationOfflineAction,
) {
  return guardOfflineAction(action);
}

function refreshNotificationQueries(queries: NotificationQueries) {
  return Promise.all([
    queries.list.refetch(),
    queries.unreadItems.refetch(),
    queries.unreadCount.refetch(),
  ]);
}
