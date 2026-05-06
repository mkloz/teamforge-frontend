import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { NotificationsCache } from "@/features/notifications/api/notifications-cache";
import { NotificationsCommands } from "@/features/notifications/api/notifications-commands";
import { NotificationsQueryFactory } from "@/features/notifications/api/notifications-query-factory";

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

  const today = items.filter(
    (item) => referenceTime - new Date(item.createdAt).getTime() < 86_400_000,
  );
  const earlier = items.filter(
    (item) => referenceTime - new Date(item.createdAt).getTime() >= 86_400_000,
  );

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
