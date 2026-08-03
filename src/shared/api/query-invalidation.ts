import type { QueryKey } from "@tanstack/react-query";

import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { resetViewerProfileQueries } from "@/shared/api/viewer-profile-cache";

function invalidateQuery(queryKey: QueryKey) {
  return appQueryClient.invalidateQueries({ queryKey });
}

function invalidateQueries(queryKeys: QueryKey[]) {
  return Promise.all(queryKeys.map((queryKey) => invalidateQuery(queryKey)));
}

function invalidateActivityGroupSurfaces() {
  return invalidateQueries([
    APP_QUERY_KEYS.activity.groups,
    APP_QUERY_KEYS.activity.chats,
    APP_QUERY_KEYS.activity.pendingInvitations,
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

export function invalidateGroupParticipationSurfaces(groupId: string) {
  return invalidateQueries([
    APP_QUERY_KEYS.activity.groupReviewState(groupId),
    APP_QUERY_KEYS.home.all,
  ]);
}

export function invalidatePlanDecisionSurfaces({
  groupId,
  planId,
}: {
  groupId?: string;
  planId?: string;
}) {
  return invalidateQueries([
    APP_QUERY_KEYS.activity.groups,
    groupId
      ? APP_QUERY_KEYS.activity.groupSelectionById(groupId)
      : APP_QUERY_KEYS.activity.groupSelection,
    planId
      ? APP_QUERY_KEYS.activity.planProposals(planId)
      : APP_QUERY_KEYS.activity.plans,
    groupId
      ? APP_QUERY_KEYS.groupPlanDetail.byId(groupId)
      : APP_QUERY_KEYS.groupPlanDetail.all,
    ...(planId
      ? [APP_QUERY_KEYS.groupPlanDetail.operationalState(planId)]
      : []),
    APP_QUERY_KEYS.home.groups,
    APP_QUERY_KEYS.home.plans,
  ]);
}

export function invalidateGroupMembershipSurfaces() {
  return Promise.all([
    resetViewerProfileQueries(),
    invalidateActivityGroupSurfaces(),
    invalidateHomeGroupSurfaces(),
    invalidateQueries([
      APP_QUERY_KEYS.explore.feed,
      APP_QUERY_KEYS.explore.groups,
    ]),
    invalidateGroupPlanDetailSurfaces(),
  ]);
}

export function invalidateFormationOpeningApplicationSurfaces() {
  return invalidateQueries([
    APP_QUERY_KEYS.explore.feed,
    APP_QUERY_KEYS.home.recommendations,
    APP_QUERY_KEYS.forge.currentProposal,
    APP_QUERY_KEYS.forge.proposalOpenings,
  ]);
}

export function invalidateFriendshipSurfaces() {
  return Promise.all([
    resetViewerProfileQueries(),
    invalidateQueries([
      APP_QUERY_KEYS.activity.friendships,
      APP_QUERY_KEYS.activity.chats,
      APP_QUERY_KEYS.activity.directSelection,
      APP_QUERY_KEYS.forge.friends,
    ]),
  ]);
}

export function invalidateUserBlockSurfaces() {
  return Promise.all([
    invalidateQuery(APP_QUERY_KEYS.settings.blockedUsers),
    invalidateFriendshipSurfaces(),
  ]);
}

export function refreshAccessSensitiveSurfaces() {
  appQueryClient.removeQueries({
    queryKey: APP_QUERY_KEYS.activity.directSelection,
  });
  appQueryClient.removeQueries({
    queryKey: APP_QUERY_KEYS.activity.groupSelection,
  });
  appQueryClient.removeQueries({
    queryKey: APP_QUERY_KEYS.groupPlanDetail.all,
  });
  appQueryClient.removeQueries({ queryKey: ["activity-messages"] });
  appQueryClient.removeQueries({ queryKey: ["activity-message-search"] });

  return Promise.all([
    invalidateUserBlockSurfaces(),
    invalidateGroupMembershipSurfaces(),
    invalidateInvitationSurfaces(),
  ]);
}

export function invalidateGroupPlanDetailSurfaces() {
  return invalidateQuery(APP_QUERY_KEYS.groupPlanDetail.all);
}

export function invalidateInvitationSurfaces() {
  return invalidateQueries([
    APP_QUERY_KEYS.activity.pendingInvitations,
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
