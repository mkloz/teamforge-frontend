import { useQuery } from "@tanstack/react-query";

import { notificationQueries } from "@/features/notifications/api/notifications-queries";

export function useNotificationQueries(enabled: boolean) {
  const list = useQuery({
    ...notificationQueries.list(),
    enabled,
  });
  const unreadItems = useQuery({
    ...notificationQueries.unreadList(),
    enabled,
  });
  const unreadCount = useQuery({
    ...notificationQueries.unreadCount(),
    enabled,
  });

  return {
    list,
    unreadCount,
    unreadItems,
  };
}

export type NotificationQueries = ReturnType<typeof useNotificationQueries>;
