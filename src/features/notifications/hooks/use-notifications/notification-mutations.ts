import { useMutation } from "@tanstack/react-query";

import { NotificationsCache } from "@/features/notifications/api/notifications-cache";
import { NotificationsCommands } from "@/features/notifications/api/notifications-commands";

export function useNotificationMutations() {
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

export type NotificationMutations = ReturnType<typeof useNotificationMutations>;
