import { useQuery } from "@tanstack/react-query";

import { activityParticipantProfileQueryOptions } from "@/features/activity/api/activity-participant-profile-query-options";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { normalizeTrustScore } from "@/shared/lib/user-psychometrics";
import type { User } from "@/shared/schemas";
import type { UserProfilePanelParticipant } from "./types";

const LEGACY_ACTIVITY_CURRENT_USER_IDS = new Set([
  "current-user",
  "user-current",
]);

export function useHydratedProfilePanelParticipant(
  participant: UserProfilePanelParticipant | undefined,
) {
  const currentUserQuery = useCurrentUserQuery();
  const currentUser = currentUserQuery.data;
  const isCurrentUser =
    participant !== undefined &&
    currentUser !== undefined &&
    participant.id === currentUser.id;
  const canFetchPublicProfile =
    participant !== undefined &&
    !isCurrentUser &&
    !LEGACY_ACTIVITY_CURRENT_USER_IDS.has(participant.id);

  const publicProfileQuery = useQuery({
    ...activityParticipantProfileQueryOptions(participant?.id ?? ""),
    enabled: canFetchPublicProfile,
  });
  const profile = isCurrentUser ? currentUser : publicProfileQuery.data;

  return {
    participant: mergeProfileParticipant(participant, profile),
    isHydratingProfile:
      canFetchPublicProfile &&
      publicProfileQuery.isLoading &&
      !hasCompleteOceanProfile(participant),
  };
}

function mergeProfileParticipant(
  participant: UserProfilePanelParticipant | undefined,
  profile: User | undefined,
): UserProfilePanelParticipant | undefined {
  if (!participant || !profile) {
    return participant;
  }

  return {
    ...participant,
    name: profile.name,
    avatar: profile.avatar,
    bio: profile.bio,
    age: profile.age,
    gender: profile.gender,
    city: profile.city,
    personalityType: profile.personalityType,
    oceanO: profile.oceanO,
    oceanC: profile.oceanC,
    oceanE: profile.oceanE,
    oceanA: profile.oceanA,
    oceanN: profile.oceanN,
    onlineStatus: profile.onlineStatus ?? participant.onlineStatus,
    trustScore: normalizeTrustScore(profile.trustScore),
  };
}

function hasCompleteOceanProfile(
  participant: UserProfilePanelParticipant | undefined,
) {
  return Boolean(
    participant &&
      typeof participant.oceanO === "number" &&
      typeof participant.oceanC === "number" &&
      typeof participant.oceanE === "number" &&
      typeof participant.oceanA === "number" &&
      typeof participant.oceanN === "number",
  );
}
