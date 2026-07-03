import type { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";

import type { NotificationMutations } from "./notification-mutations";
import {
  NOTIFICATION_OFFLINE_ACTIONS,
  type NotificationOfflineAction,
} from "./notification-offline-actions";

type GuardOfflineAction = ReturnType<
  typeof useOfflineActionGuard
>["guardOfflineAction"];

export function createNotificationActions({
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
