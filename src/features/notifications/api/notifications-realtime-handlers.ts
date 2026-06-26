import { NotificationsCache } from "@/features/notifications/api/notifications-cache";
import { appQueryClient } from "@/shared/api/query-client";
import {
  invalidateFriendshipSurfaces,
  invalidateGroupMembershipSurfaces,
  invalidateProfileFriendRequestSurfaces,
} from "@/shared/api/query-invalidation";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { Notification } from "@/shared/schemas";

type NotificationInvalidationRule = {
  invalidate: () => void;
  matches: (notification: Notification) => boolean;
};

const GROUP_MEMBERSHIP_NOTIFICATION_TYPES = new Set<Notification["type"]>([
  "GROUP_JOIN_APPROVED",
  "GROUP_MEMBER_LEFT",
  "GROUP_DISBANDED",
]);

const NOTIFICATION_INVALIDATION_RULES: NotificationInvalidationRule[] = [
  {
    invalidate: invalidateGroupInviteSurfaces,
    matches: (notification) => notification.type === "GROUP_INVITE",
  },
  {
    invalidate: invalidateGroupMembershipNotificationSurfaces,
    matches: isGroupMembershipNotification,
  },
  {
    invalidate: invalidateFriendRequestSurfaces,
    matches: (notification) => notification.type === "FRIEND_REQUEST",
  },
  {
    invalidate: invalidateFriendAcceptedSurfaces,
    matches: (notification) => notification.type === "FRIEND_ACCEPTED",
  },
];

export const NotificationsRealtimeHandlers = {
  addIncomingNotification(notification: Notification) {
    const shouldReplaceExisting =
      NotificationsCache.shouldReplaceCachedNotification(notification);

    NotificationsCache.applyNotificationUpdate(notification);

    if (shouldReplaceExisting) {
      invalidateNotificationSurfaces(notification);
    }
  },
};

function invalidateNotificationSurfaces(notification: Notification) {
  for (const rule of NOTIFICATION_INVALIDATION_RULES) {
    if (rule.matches(notification)) {
      rule.invalidate();
    }
  }
}

function invalidateGroupInviteSurfaces() {
  void Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.home.invitations,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.home.sentInvitations,
    }),
  ]);
}

function invalidateGroupMembershipNotificationSurfaces() {
  void invalidateGroupMembershipSurfaces();
}

function invalidateFriendRequestSurfaces() {
  void invalidateProfileFriendRequestSurfaces();
}

function invalidateFriendAcceptedSurfaces() {
  void Promise.all([
    invalidateProfileFriendRequestSurfaces(),
    invalidateFriendshipSurfaces(),
  ]);
}

function isGroupMembershipNotification(notification: Notification) {
  return GROUP_MEMBERSHIP_NOTIFICATION_TYPES.has(notification.type);
}
