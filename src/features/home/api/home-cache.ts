import {
  HOME_GROUPS_QUERY_KEY,
  HOME_INVITATIONS_QUERY_KEY,
  HOME_RECOMMENDATIONS_QUERY_KEY,
} from "@/features/home/api/home-query-keys";
import type { HomeGroup } from "@/features/home/schemas/home-group.schema";
import { applyHomeInvitationUpdate } from "@/shared/api/query-cache-updaters";
import { appQueryClient } from "@/shared/api/query-client";
import type { ExploreGroup, Invite } from "@/shared/schemas";

export const HomeCache = {
  applyInvitationUpdate(invite: Invite) {
    applyHomeInvitationUpdate(invite);
  },

  cancelInvitations() {
    return appQueryClient.cancelQueries({
      queryKey: HOME_INVITATIONS_QUERY_KEY,
    });
  },

  getInvitationsSnapshot() {
    return appQueryClient.getQueryData<Invite[]>(HOME_INVITATIONS_QUERY_KEY);
  },

  removeInvitation(inviteId: string) {
    appQueryClient.setQueryData<Invite[] | undefined>(
      HOME_INVITATIONS_QUERY_KEY,
      (invitations) =>
        invitations?.filter((invite) => invite.id !== inviteId) ?? invitations,
    );
  },

  restoreInvitations(invitations: Invite[] | undefined) {
    appQueryClient.setQueryData(HOME_INVITATIONS_QUERY_KEY, invitations);
  },

  removeRecommendedGroup(groupId: string) {
    appQueryClient.setQueryData<ExploreGroup[] | undefined>(
      HOME_RECOMMENDATIONS_QUERY_KEY,
      (groups) => groups?.filter((group) => group.id !== groupId),
    );
  },

  cancelRecommendations() {
    return appQueryClient.cancelQueries({
      queryKey: HOME_RECOMMENDATIONS_QUERY_KEY,
    });
  },

  getRecommendationsSnapshot() {
    return appQueryClient.getQueryData<ExploreGroup[]>(
      HOME_RECOMMENDATIONS_QUERY_KEY,
    );
  },

  restoreRecommendations(recommendations: ExploreGroup[] | undefined) {
    appQueryClient.setQueryData(
      HOME_RECOMMENDATIONS_QUERY_KEY,
      recommendations,
    );
  },

  clearPendingParticipationPlan(groupId: string, planId: string) {
    appQueryClient.setQueryData<HomeGroup[] | undefined>(
      HOME_GROUPS_QUERY_KEY,
      (groups) =>
        groups?.map((group) =>
          group.id === groupId && group.pendingParticipationPlan?.id === planId
            ? { ...group, pendingParticipationPlan: null }
            : group,
        ),
    );
  },
};
