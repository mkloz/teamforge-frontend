import type { GroupApi, User } from "@/shared/schemas";

import type { UserStats } from "@/features/home/types/home.types";

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

export function buildHomeStats(user: User, groups: GroupApi[]): UserStats {
  return {
    trustScore: normalizeScore(user.trustScore),
    groupsJoined: groups.length,
    activitiesDone: groups.filter((group) => group.status === "COMPLETED")
      .length,
    connections: countUniqueConnections(groups, user.id),
    profileCompleteness: getProfileCompleteness(user),
  };
}
