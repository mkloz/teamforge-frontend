import { useQuery } from "@tanstack/react-query";

import { notificationQueries } from "@/features/notifications/api/notifications-queries";

interface UseUnreadNotificationCountOptions {
  enabled?: boolean;
}

export function useUnreadNotificationCount({
  enabled = true,
}: UseUnreadNotificationCountOptions = {}) {
  const unreadCountQuery = useQuery({
    ...notificationQueries.unreadCount(),
    enabled,
  });

  return {
    count: unreadCountQuery.data ?? 0,
    hasCountData: unreadCountQuery.data !== undefined,
    isError: unreadCountQuery.isError,
    isLoading: unreadCountQuery.isLoading,
  };
}
