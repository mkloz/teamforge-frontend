import { NotificationsCache } from "@/features/notifications/api/notifications-cache";
import { appQueryClient } from "@/shared/api/query-client";
import {
  invalidateExploreFriendRequestSurfaces,
  invalidateFriendshipSurfaces,
  invalidateGroupMembershipSurfaces,
} from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { Notification } from "@/shared/schemas";

export const NotificationsRealtimeHandlers = {
  addIncomingNotification(notification: Notification) {
    const shouldReplaceExisting =
      NotificationsCache.shouldReplaceCachedNotification(notification);

    NotificationsCache.applyNotificationUpdate(notification);

    if (!shouldReplaceExisting) {
      return;
    }

    if (notification.type === "GROUP_INVITE") {
      void Promise.all([
        appQueryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.home.invitations,
        }),
        appQueryClient.invalidateQueries({
          queryKey: APP_QUERY_KEYS.home.sentInvitations,
        }),
      ]);
    }

    if (
      notification.type === "GROUP_JOIN_APPROVED" ||
      notification.type === "GROUP_MEMBER_LEFT" ||
      notification.type === "GROUP_DISBANDED"
    ) {
      void invalidateGroupMembershipSurfaces();
    }

    if (notification.type === "FRIEND_REQUEST") {
      void invalidateExploreFriendRequestSurfaces();
    }

    if (notification.type === "FRIEND_ACCEPTED") {
      void Promise.all([
        invalidateExploreFriendRequestSurfaces(),
        invalidateFriendshipSurfaces(),
      ]);
    }
  },
};
