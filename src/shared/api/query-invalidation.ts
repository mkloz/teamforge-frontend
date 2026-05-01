import { appQueryClient } from "@/shared/api/query-client";

import { APP_QUERY_KEYS } from "./query-keys";

export function invalidateActivityGroupSurfaces() {
  return Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.groups,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.chats,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.groupSelection,
    }),
  ]);
}

export function invalidateHomeGroupSurfaces() {
  return Promise.all([
    appQueryClient.invalidateQueries({ queryKey: APP_QUERY_KEYS.home.groups }),
    appQueryClient.invalidateQueries({ queryKey: APP_QUERY_KEYS.home.plans }),
    appQueryClient.invalidateQueries({ queryKey: APP_QUERY_KEYS.home.stats }),
  ]);
}

export function invalidateGroupMembershipSurfaces() {
  return Promise.all([
    invalidateActivityGroupSurfaces(),
    invalidateHomeGroupSurfaces(),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.explore.groups,
    }),
  ]);
}

export function invalidateFriendshipSurfaces() {
  return Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.friendships,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.chats,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.activity.directSelection,
    }),
  ]);
}

export function invalidateInvitationSurfaces() {
  return Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.home.invitations,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.home.sentInvitations,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.notifications.unreadCount,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.notifications.list,
    }),
  ]);
}

export function invalidateNotificationSurfaces() {
  return Promise.all([
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.notifications.list,
    }),
    appQueryClient.invalidateQueries({
      queryKey: APP_QUERY_KEYS.notifications.unreadCount,
    }),
  ]);
}

export function invalidateExploreFriendRequestSurfaces() {
  return appQueryClient.invalidateQueries({
    queryKey: APP_QUERY_KEYS.explore.friendRequests,
  });
}
