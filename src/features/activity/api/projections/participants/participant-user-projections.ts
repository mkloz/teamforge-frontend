import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import type {
  FriendshipUserApi,
  GroupMemberApi,
  ImageMedia,
  User,
} from "@/shared/schemas";

import { normalizeTrustScore } from "./participant-score-normalizers";

type ParticipantUserSummary = {
  id: string;
  name: string;
  avatar: string | null;
  avatarMedia?: ImageMedia | null;
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
  trustScore?: number | null;
};

interface ParticipantUserProjectionOptions {
  includeAvatarMedia?: boolean;
  lastReadMessageId?: string | null;
  trustScore?: number | null;
}

export function mapParticipantUserSummary(
  user: ParticipantUserSummary,
  options: ParticipantUserProjectionOptions = {},
): ActivityParticipant {
  const participant: ActivityParticipant = {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    ...mapParticipantProfileFields(user),
    onlineStatus: user.onlineStatus,
    trustScore: getProjectedTrustScore(user, options),
  };

  return applyParticipantProjectionOptions(participant, user, options);
}

function mapParticipantProfileFields(user: ParticipantUserSummary) {
  return {
    bio: nullableParticipantField(user.bio),
    age: nullableParticipantField(user.age),
    gender: nullableParticipantField(user.gender),
    city: nullableParticipantField(user.city),
    personalityType: nullableParticipantField(user.personalityType),
    oceanO: nullableParticipantField(user.oceanO),
    oceanC: nullableParticipantField(user.oceanC),
    oceanE: nullableParticipantField(user.oceanE),
    oceanA: nullableParticipantField(user.oceanA),
    oceanN: nullableParticipantField(user.oceanN),
  };
}

function nullableParticipantField<T>(value: T | null | undefined) {
  return value ?? null;
}

function getProjectedTrustScore(
  user: ParticipantUserSummary,
  options: ParticipantUserProjectionOptions,
) {
  if ("trustScore" in options) {
    return normalizeTrustScore(options.trustScore ?? 0);
  }

  return normalizeTrustScore(user.trustScore ?? 0);
}

function applyParticipantProjectionOptions(
  participant: ActivityParticipant,
  user: ParticipantUserSummary,
  options: ParticipantUserProjectionOptions,
) {
  if (options.includeAvatarMedia) {
    participant.avatarMedia = user.avatarMedia ?? null;
  }

  if ("lastReadMessageId" in options) {
    participant.lastReadMessageId = options.lastReadMessageId;
  }

  return participant;
}

export function mapFriendshipUserParticipant(
  user: FriendshipUserApi,
): ActivityParticipant {
  return mapParticipantUserSummary(user, { includeAvatarMedia: true });
}

export function mapGroupMemberParticipant(
  member: GroupMemberApi,
): ActivityParticipant {
  return mapParticipantUserSummary(member.user, { includeAvatarMedia: true });
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
