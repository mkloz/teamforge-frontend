import { queryOptions } from "@tanstack/react-query";

import { applyHomeInvitationUpdate } from "@/shared/api/query-cache-updaters";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import { invalidateGroupMembershipSurfaces } from "@/shared/api/query-invalidation";
import type { ExploreGroup, GroupApi, Invite, User } from "@/shared/schemas";

import { HomeApi } from "./home.api";
import {
  HOME_GROUPS_QUERY_KEY,
  HOME_INVITATIONS_QUERY_KEY,
  HOME_RECOMMENDATIONS_QUERY_KEY,
  HOME_SENT_INVITATIONS_QUERY_KEY,
} from "./home-query-keys";

export interface UserStats {
  trustScore: number;
  groupsJoined: number;
  activitiesDone: number;
  connections: number;
  profileCompleteness: number;
}

export interface HomeViewer {
  firstName: string;
  mbti: User["personalityType"] | null;
  nextStep:
    | {
        kind: "security";
        title: string;
        body: string;
        label: string;
      }
    | {
        kind: "account";
        title: string;
        body: string;
        label: string;
      }
    | {
        kind: "personality";
        title: string;
        body: string;
        label: string;
      }
    | {
        kind: "interests";
        title: string;
        body: string;
        label: string;
      }
    | null;
}

export type PlannedGroup = GroupApi & {
  plan: NonNullable<GroupApi["plan"]>;
};

export const EMPTY_HOME_STATS: UserStats = {
  trustScore: 0,
  groupsJoined: 0,
  activitiesDone: 0,
  connections: 0,
  profileCompleteness: 0,
};

function normalizeScore(score: number) {
  if (score > 0 && score <= 1) {
    return Math.round(score * 100);
  }

  return Math.round(score);
}

function getProfileCompleteness(user: User) {
  const fields = [
    Boolean(user.avatar),
    Boolean(user.bio),
    Boolean(user.city),
    Boolean(user.personalityType),
    Boolean(user.age),
    Boolean(user.interests?.length),
  ];

  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function hasCompleteOceanProfile(user: User) {
  return (
    user.oceanO !== null &&
    user.oceanC !== null &&
    user.oceanE !== null &&
    user.oceanA !== null &&
    user.oceanN !== null
  );
}

function countUniqueConnections(groups: GroupApi[], currentUserId: string) {
  const connectionIds = new Set<string>();

  for (const group of groups) {
    for (const member of group.members) {
      if (member.userId !== currentUserId) {
        connectionIds.add(member.userId);
      }
    }
  }

  return connectionIds.size;
}

function hasPlan(group: GroupApi): group is PlannedGroup {
  return group.plan !== null;
}

function isActivePlan(group: PlannedGroup) {
  return group.plan.status !== "COMPLETED" && group.plan.status !== "CANCELLED";
}

export class HomeQueries {
  static getViewer(user?: User | null): HomeViewer {
    const nextStep = user
      ? !user.emailVerified
        ? {
            kind: "security" as const,
            title: "Secure your account",
            body: "Check your verification and recovery settings before you start building new groups.",
            label: "Open security",
          }
        : !user.bio || !user.city || user.age === null
          ? {
              kind: "account" as const,
              title: "Finish your public profile",
              body: "Add the missing basics people rely on when they open your profile.",
              label: "Complete profile",
            }
          : !user.personalityType || !hasCompleteOceanProfile(user)
            ? {
                kind: "personality" as const,
                title: "Complete your personality profile",
                body: "Your forge results get sharper once your personality data is fully calibrated.",
                label: "Update personality",
              }
            : !(user.interests?.length ?? 0)
              ? {
                  kind: "interests" as const,
                  title: "Add your interests",
                  body: "Interests help TeamForge connect you with groups that actually fit your energy.",
                  label: "Choose interests",
                }
              : null
      : null;

    return {
      firstName: user?.name.trim().split(/\s+/)[0] ?? "there",
      mbti: user?.personalityType ?? null,
      nextStep,
    };
  }

  static groupsSource() {
    return queryOptions({
      queryKey: HOME_GROUPS_QUERY_KEY,
      queryFn: () => HomeApi.getGroups(),
      staleTime: 60_000,
    });
  }

  static invitationsSource() {
    return queryOptions({
      queryKey: HOME_INVITATIONS_QUERY_KEY,
      queryFn: () => HomeApi.getInvitations(),
      staleTime: 60_000,
    });
  }

  static recommendationsSource() {
    return queryOptions({
      queryKey: HOME_RECOMMENDATIONS_QUERY_KEY,
      queryFn: async (): Promise<ExploreGroup[]> => {
        const groups = await HomeApi.getRecommendations();

        return [...groups].sort(
          (left, right) => right.compatibility.total - left.compatibility.total,
        );
      },
      staleTime: 60_000,
    });
  }

  static sentInvitationsSource() {
    return queryOptions({
      queryKey: HOME_SENT_INVITATIONS_QUERY_KEY,
      queryFn: () => HomeApi.getSentInvitations(),
      staleTime: 60_000,
    });
  }

  static stats() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.home.stats,
      queryFn: async (): Promise<UserStats> => {
        const [currentUser, groups] = await Promise.all([
          appQueryClient.ensureQueryData(currentUserQueryOptions()),
          appQueryClient.ensureQueryData(HomeQueries.groupsSource()),
        ]);

        return {
          trustScore: normalizeScore(currentUser.trustScore),
          groupsJoined: groups.length,
          activitiesDone: groups.filter((group) => group.status === "COMPLETED")
            .length,
          connections: countUniqueConnections(groups, currentUser.id),
          profileCompleteness: getProfileCompleteness(currentUser),
        };
      },
      staleTime: 60_000,
    });
  }

  static plans() {
    return queryOptions({
      queryKey: APP_QUERY_KEYS.home.plans,
      queryFn: async (): Promise<PlannedGroup[]> => {
        const groups = await appQueryClient.ensureQueryData(
          HomeQueries.groupsSource(),
        );

        return groups
          .filter(hasPlan)
          .filter(isActivePlan)
          .sort((left, right) => {
            const leftTime = left.plan.dateTime
              ? new Date(left.plan.dateTime).getTime()
              : Number.MAX_SAFE_INTEGER;
            const rightTime = right.plan.dateTime
              ? new Date(right.plan.dateTime).getTime()
              : Number.MAX_SAFE_INTEGER;

            return leftTime - rightTime;
          });
      },
      staleTime: 60_000,
    });
  }

  static groups() {
    return HomeQueries.groupsSource();
  }

  static invitations() {
    return HomeQueries.invitationsSource();
  }

  static recommendations() {
    return HomeQueries.recommendationsSource();
  }

  static sentInvitations() {
    return HomeQueries.sentInvitationsSource();
  }

  static acceptInvitation(inviteId: string) {
    return HomeApi.acceptInvitation(inviteId).then(async (invite) => {
      this.applyInvitationUpdate(invite);

      await invalidateGroupMembershipSurfaces();

      return invite;
    });
  }

  static declineInvitation(inviteId: string) {
    return HomeApi.declineInvitation(inviteId).then((invite) => {
      this.applyInvitationUpdate(invite);
      return invite;
    });
  }

  static applyInvitationUpdate(invite: Invite) {
    applyHomeInvitationUpdate(invite);
  }
}

export {
  HOME_GROUPS_QUERY_KEY,
  HOME_INVITATIONS_QUERY_KEY,
  HOME_RECOMMENDATIONS_QUERY_KEY,
  HOME_SENT_INVITATIONS_QUERY_KEY,
};
