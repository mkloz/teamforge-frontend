import type { FriendshipUserApi, GroupMemberApi, User } from "@/shared/schemas";

import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";

import { normalizeTrustScore } from "./participant-score-normalizers";

export function mapFriendshipUserParticipant(
  user: FriendshipUserApi,
): ActivityParticipant {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    city: user.city ?? null,
    personalityType: user.personalityType,
    onlineStatus: user.onlineStatus,
    trustScore: normalizeTrustScore(user.trustScore),
  };
}

export function mapGroupMemberParticipant(
  member: GroupMemberApi,
): ActivityParticipant {
  return {
    id: member.user.id,
    name: member.user.name,
    avatar: member.user.avatar,
    onlineStatus: member.user.onlineStatus,
    personalityType: member.user.personalityType,
    trustScore: normalizeTrustScore(member.user.trustScore),
  };
}

export function mapCurrentUserParticipant(user: User): ActivityParticipant {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    age: user.age,
    gender: user.gender,
    city: user.city,
    personalityType: user.personalityType,
    oceanO: user.oceanO,
    oceanC: user.oceanC,
    oceanE: user.oceanE,
    oceanA: user.oceanA,
    oceanN: user.oceanN,
    onlineStatus: user.onlineStatus,
    trustScore: normalizeTrustScore(user.trustScore),
  };
}
