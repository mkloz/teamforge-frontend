import type { QueryKey } from "@tanstack/react-query";

import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";

function invalidateQuery(queryKey: QueryKey) {
  return appQueryClient.invalidateQueries({ queryKey });
}

function invalidateQueries(queryKeys: QueryKey[]) {
  return Promise.all(queryKeys.map((queryKey) => invalidateQuery(queryKey)));
}

export function invalidateActivityGroupSurfaces() {
  return invalidateQueries([
    APP_QUERY_KEYS.activity.groups,
    APP_QUERY_KEYS.activity.chats,
    APP_QUERY_KEYS.activity.groupSelection,
  ]);
}

export function invalidateHomeGroupSurfaces() {
  return invalidateQueries([
    APP_QUERY_KEYS.home.groups,
    APP_QUERY_KEYS.home.plans,
    APP_QUERY_KEYS.home.stats,
    APP_QUERY_KEYS.home.recommendations,
  ]);
}

export function invalidateGroupMembershipSurfaces() {
  return Promise.all([
    invalidateActivityGroupSurfaces(),
    invalidateHomeGroupSurfaces(),
    invalidateQuery(APP_QUERY_KEYS.explore.groups),
    invalidateGroupPlanDetailSurfaces(),
  ]);
}

export function invalidateFriendshipSurfaces() {
  return invalidateQueries([
    APP_QUERY_KEYS.activity.friendships,
    APP_QUERY_KEYS.activity.chats,
    APP_QUERY_KEYS.activity.directSelection,
    APP_QUERY_KEYS.forge.friends,
  ]);
}

export function invalidateGroupPlanDetailSurfaces() {
  return invalidateQuery(APP_QUERY_KEYS.groupPlanDetail.all);
}

export function invalidateInvitationSurfaces() {
  return invalidateQueries([
    APP_QUERY_KEYS.home.invitations,
    APP_QUERY_KEYS.home.sentInvitations,
    APP_QUERY_KEYS.notifications.unreadCount,
    APP_QUERY_KEYS.notifications.list,
    APP_QUERY_KEYS.notifications.unreadList,
  ]);
}

export function invalidateNotificationSurfaces() {
  return invalidateQueries([
    APP_QUERY_KEYS.notifications.list,
    APP_QUERY_KEYS.notifications.unreadCount,
    APP_QUERY_KEYS.notifications.unreadList,
  ]);
}

export function invalidateProfileFriendRequestSurfaces() {
  return invalidateQuery(APP_QUERY_KEYS.profile.friendRequests);
}
