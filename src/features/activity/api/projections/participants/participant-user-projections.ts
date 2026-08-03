import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import type {
  FriendshipUserApi,
  GroupMemberApi,
  ImageMedia,
  User,
} from "@/shared/schemas";

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
  onlineStatus?: ActivityParticipant["onlineStatus"];
  lastSeenAt?: ActivityParticipant["lastSeenAt"];
  presenceLabel?: ActivityParticipant["presenceLabel"];
  presencePrecision?: ActivityParticipant["presencePrecision"];
  trustScore?: number;
};

interface ParticipantUserProjectionOptions {
  includeAvatarMedia?: boolean;
  lastReadMessageId?: string | null;
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
    lastSeenAt: user.lastSeenAt,
    onlineStatus: user.onlineStatus,
    presenceLabel: user.presenceLabel,
    presencePrecision: user.presencePrecision,
    trustScore: user.trustScore,
  };

  return applyParticipantProjectionOptions(participant, user, options);
}

function mapParticipantProfileFields(user: ParticipantUserSummary) {
  return {
    ...(user.bio !== undefined && { bio: user.bio }),
    ...(user.age !== undefined && { age: user.age }),
    ...(user.gender !== undefined && { gender: user.gender }),
    ...(user.city !== undefined && { city: user.city }),
    ...(user.personalityType !== undefined && {
      personalityType: user.personalityType,
    }),
  };
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
    lastSeenAt: user.lastSeenAt,
    onlineStatus: user.onlineStatus,
    trustScore: user.trustScore,
  };
}
