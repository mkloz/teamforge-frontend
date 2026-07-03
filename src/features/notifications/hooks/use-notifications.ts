import { useState } from "react";

import { groupNotificationsByRecency } from "@/features/notifications/lib/notification-groups";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

import { createNotificationActions } from "./use-notifications/notification-actions";
import {
  getIsRefreshingNotifications,
  getUnreadNotificationCount,
  getUnreadNotificationItems,
  refreshNotificationQueries,
} from "./use-notifications/notification-derived-state";
import { useNotificationMutations } from "./use-notifications/notification-mutations";
import { useNotificationQueries } from "./use-notifications/notification-queries";

interface UseNotificationsOptions {
  enabled?: boolean;
}

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
