import type {
  ChatApi,
  FriendshipUserApi,
  GroupMemberApi,
  User,
} from "@/shared/schemas";

import type {
  ActivityParticipant,
  Group,
  GroupMember,
} from "@/features/activity/lib/activity-contract";

export function normalizeTrustScore(score: number) {
  return score > 0 && score <= 1 ? Math.round(score * 100) : Math.round(score);
}

export function normalizeCompatibilityScore(score: number | null) {
  if (score === null) {
    return null;
  }

  return score > 0 && score <= 1 ? Math.round(score * 100) : Math.round(score);
}

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

export function mapGroupMember(
  member: GroupMemberApi,
  groupId: string,
): GroupMember {
  return {
    userId: member.userId,
    groupId,
    role: member.role,
    joinedAt: member.joinedAt,
    leftAt: member.leftAt,
    compatibilityScore: normalizeCompatibilityScore(member.compatibilityScore),
    user: mapGroupMemberParticipant(member),
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

export function buildParticipantsFromChatSummary(
  chat: ChatApi,
  currentUser: User,
) {
  const currentUserParticipant = mapCurrentUserParticipant(currentUser);
  const normalizedCurrentUserParticipant = {
    ...currentUserParticipant,
    onlineStatus: currentUserParticipant.onlineStatus,
  };
  const participants =
    chat.participants?.map((participant) => ({
      id: participant.user.id,
      name: participant.user.name,
      avatar: participant.user.avatar,
      onlineStatus: participant.user.onlineStatus,
      trustScore:
        participant.user.id === currentUser.id
          ? currentUserParticipant.trustScore
          : 0,
    })) ?? [];

  if (!participants.some((participant) => participant.id === currentUser.id)) {
    participants.push(normalizedCurrentUserParticipant);
  } else {
    return participants.map((participant) =>
      participant.id === currentUser.id
        ? normalizedCurrentUserParticipant
        : participant,
    );
  }

  return participants;
}

export function buildGroupParticipants(
  group: Group,
  currentUserParticipant: ActivityParticipant,
) {
  const participants =
    group.members
      ?.map((member: GroupMember) => member.user)
      .filter(
        (participant): participant is ActivityParticipant =>
          participant !== undefined,
      ) ?? [];

  if (
    !participants.some(
      (participant) => participant.id === currentUserParticipant.id,
    )
  ) {
    participants.unshift(currentUserParticipant);
  }

  return participants;
}
