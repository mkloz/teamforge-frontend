import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  NOTIFICATIONS_QUERY_KEY,
  NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
  NotificationsQueries,
} from "../api/notifications.queries";
import type { Notification } from "@/shared/schemas";

export function useNotifications() {
  const queryClient = useQueryClient();
  const { data } = useQuery(NotificationsQueries.list());
  const unreadCountQuery = useQuery(NotificationsQueries.unreadCount());
  const items = data ?? [];
  const [referenceTime] = useState(() => Date.now());

  const markReadMutation = useMutation({
    mutationKey: ["notifications", "mark-read"],
    mutationFn: NotificationsQueries.markRead,
    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
        queryClient.cancelQueries({
          queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
        }),
      ]);

      const previousItems = queryClient.getQueryData<Notification[]>(
        NOTIFICATIONS_QUERY_KEY,
      );
      const previousCount = queryClient.getQueryData<number>(
        NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
      );

      NotificationsQueries.optimisticallyMarkRead(id);

      return {
        previousItems,
        previousCount,
      };
    },
    onError: (_error, _id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          NOTIFICATIONS_QUERY_KEY,
          context.previousItems,
        );
      }

      if (typeof context?.previousCount === "number") {
        queryClient.setQueryData(
          NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
          context.previousCount,
        );
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
        }),
      ]);
    },
  });

  const markAllReadMutation = useMutation({
    mutationKey: ["notifications", "mark-all-read"],
    mutationFn: NotificationsQueries.markAllRead,
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
        queryClient.cancelQueries({
          queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
        }),
      ]);

      const previousItems = queryClient.getQueryData<Notification[]>(
        NOTIFICATIONS_QUERY_KEY,
      );
      const previousCount = queryClient.getQueryData<number>(
        NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
      );

      NotificationsQueries.optimisticallyMarkAllRead();

      return {
        previousItems,
        previousCount,
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          NOTIFICATIONS_QUERY_KEY,
          context.previousItems,
        );
      }

      if (typeof context?.previousCount === "number") {
        queryClient.setQueryData(
          NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
          context.previousCount,
        );
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
        queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_UNREAD_COUNT_QUERY_KEY,
        }),
      ]);
    },
  });

  const count =
    unreadCountQuery.data ?? NotificationsQueries.countUnread(items);

  const today = items.filter(
    (item) => referenceTime - new Date(item.createdAt).getTime() < 86_400_000,
  );
  const earlier = items.filter(
    (item) => referenceTime - new Date(item.createdAt).getTime() >= 86_400_000,
  );

  return {
    items,
    today,
    earlier,
    count,
    isLoading: unreadCountQuery.isLoading && items.length === 0,
    isMarkingAllRead: markAllReadMutation.isPending,
    markRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => markAllReadMutation.mutate(),
  };
}
