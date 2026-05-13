import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import type { FriendshipUserApi, GroupMemberApi, User } from "@/shared/schemas";

import { normalizeTrustScore } from "./participant-score-normalizers";

type ParticipantUserSummary = {
  id: string;
  name: string;
  avatar: string | null;
  bio?: string | null;
  age?: number | null;
  gender?: ActivityParticipant["gender"];
  city?: string | null;
  personalityType?: ActivityParticipant["personalityType"];
  oceanO?: number | null;
  oceanC?: number | null;
  oceanE?: number | null;
  oceanA?: number | null;
  oceanN?: number | null;
  onlineStatus?: ActivityParticipant["onlineStatus"];
  trustScore: number;
};

function mapParticipantUserSummary(
  user: ParticipantUserSummary,
): ActivityParticipant {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio ?? null,
    age: user.age ?? null,
    gender: user.gender ?? null,
    city: user.city ?? null,
    personalityType: user.personalityType ?? null,
    oceanO: user.oceanO ?? null,
    oceanC: user.oceanC ?? null,
    oceanE: user.oceanE ?? null,
    oceanA: user.oceanA ?? null,
    oceanN: user.oceanN ?? null,
    onlineStatus: user.onlineStatus,
    trustScore: normalizeTrustScore(user.trustScore),
  };
}

export function mapFriendshipUserParticipant(
  user: FriendshipUserApi,
): ActivityParticipant {
  return mapParticipantUserSummary(user);
}

export function mapGroupMemberParticipant(
  member: GroupMemberApi,
): ActivityParticipant {
  return mapParticipantUserSummary(member.user);
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
