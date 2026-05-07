import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { NotificationsCache } from "@/features/notifications/api/notifications-cache";
import { NotificationsCommands } from "@/features/notifications/api/notifications-commands";
import { NotificationsQueryFactory } from "@/features/notifications/api/notifications-query-factory";
import { groupNotificationsByRecency } from "@/features/notifications/lib/notification-groups";

export function useUnreadNotificationCount() {
  const unreadCountQuery = useQuery(NotificationsQueryFactory.unreadCount());

  return {
    count: unreadCountQuery.data ?? 0,
    isLoading: unreadCountQuery.isLoading,
  };
}

export function useUnreadNotifications() {
  const unreadItemsQuery = useQuery(NotificationsQueryFactory.unreadList());

  return {
    unreadItems: unreadItemsQuery.data ?? [],
    isLoading: unreadItemsQuery.isLoading,
  };
}

export function useNotifications() {
  const { data } = useQuery(NotificationsQueryFactory.list());
  const unreadItemsQuery = useQuery(NotificationsQueryFactory.unreadList());
  const unreadCountQuery = useQuery(NotificationsQueryFactory.unreadCount());
  const items = data ?? [];
  const unreadItems =
    unreadItemsQuery.data ?? items.filter((item) => !item.isRead);
  const [referenceTime] = useState(() => Date.now());

  const markReadMutation = useMutation({
    mutationKey: ["notifications", "mark-read"],
    mutationFn: NotificationsCommands.markRead,
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

  const markAllReadMutation = useMutation({
    mutationKey: ["notifications", "mark-all-read"],
    mutationFn: NotificationsCommands.markAllRead,
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

  const { today, earlier } = groupNotificationsByRecency(items, referenceTime);

  return {
    items,
    unreadItems,
    today,
    earlier,
    count,
    isLoading: unreadCountQuery.isLoading && items.length === 0,
    isMarkingAllRead: markAllReadMutation.isPending,
    markRead: (id: string) => markReadMutation.mutate(id),
    markReadAsync: (id: string) => markReadMutation.mutateAsync(id),
    markAllRead: () => markAllReadMutation.mutate(),
  };
}
