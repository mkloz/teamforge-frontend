import { useQuery } from "@tanstack/react-query";

import { NotificationsQueryFactory } from "@/features/notifications/api/notifications-query-factory";

interface UseUnreadNotificationCountOptions {
  enabled?: boolean;
}

export function useUnreadNotificationCount({
  enabled = true,
}: UseUnreadNotificationCountOptions = {}) {
  const unreadCountQuery = useQuery({
    ...NotificationsQueryFactory.unreadCount(),
    enabled,
  });

  return {
    count: unreadCountQuery.data ?? 0,
    isLoading: unreadCountQuery.isLoading,
  };
}
