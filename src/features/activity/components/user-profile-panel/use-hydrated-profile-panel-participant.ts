import { useQuery } from "@tanstack/react-query";

import { activityParticipantProfileQueryOptions } from "@/features/activity/api/activity-participant-profile-query-options";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import type { User } from "@/shared/schemas";
import type { ViewerProfile } from "@/shared/schemas/viewer-profile";
import type {
  ProfilePanelDataState,
  UserProfilePanelParticipant,
} from "./types";

const LEGACY_ACTIVITY_CURRENT_USER_IDS = new Set([
  "current-user",
  "user-current",
]);

export function useHydratedProfilePanelParticipant(
  participant: UserProfilePanelParticipant | undefined,
) {
  const currentUserQuery = useCurrentUserQuery();
  const currentUser = currentUserQuery.data;
  const isCurrentUser = isCurrentUserParticipant(participant, currentUser);
  const canFetchPublicProfile = canFetchProfilePanelPublicProfile(
    participant,
    isCurrentUser,
  );

  const publicProfileQuery = useQuery({
    ...activityParticipantProfileQueryOptions(participant?.id ?? ""),
    enabled: canFetchPublicProfile,
  });
  const hydratedParticipant = isCurrentUser
    ? mergeCurrentUserParticipant(participant, currentUser)
    : mergeViewerProfileParticipant(participant, publicProfileQuery.data);
  const profileState = getProfilePanelDataState({
    canFetchPublicProfile,
    currentUserError: currentUserQuery.isError,
    currentUserLoading: currentUserQuery.isLoading,
    isCurrentUser,
    publicProfileError: publicProfileQuery.isError,
    publicProfileLoading: publicProfileQuery.isLoading,
    viewerContext: publicProfileQuery.data?.viewerContext,
  });

  return {
    participant: hydratedParticipant,
    profileState,
    retryProfile: () => {
      void (isCurrentUser
        ? currentUserQuery.refetch()
        : publicProfileQuery.refetch());
    },
  };
}

function isCurrentUserParticipant(
  participant: UserProfilePanelParticipant | undefined,
  currentUser: User | undefined,
) {
  return Boolean(
    participant && currentUser && participant.id === currentUser.id,
  );
}

function canFetchProfilePanelPublicProfile(
  participant: UserProfilePanelParticipant | undefined,
  isCurrentUser: boolean,
) {
  return Boolean(
    participant &&
      !isCurrentUser &&
      !LEGACY_ACTIVITY_CURRENT_USER_IDS.has(participant.id),
  );
}

function mergeCurrentUserParticipant(
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
  };
}

function mergeViewerProfileParticipant(
  participant: UserProfilePanelParticipant | undefined,
  profile: ViewerProfile | undefined,
): UserProfilePanelParticipant | undefined {
  if (!participant || !profile) {
    return participant;
  }

  const personality = profile.personalityProfile;

  return {
    ...participant,
    name: profile.name,
    avatar: profile.avatar,
    bio: profile.bio,
    age: profile.age,
    gender: profile.gender,
    city: profile.city,
    personalityType: personality?.personalityType ?? null,
    oceanO: personality?.ocean.openness ?? null,
    oceanC: personality?.ocean.conscientiousness ?? null,
    oceanE: personality?.ocean.extraversion ?? null,
    oceanA: personality?.ocean.agreeableness ?? null,
    oceanN: personality?.ocean.neuroticism ?? null,
  };
}

function getProfilePanelDataState({
  canFetchPublicProfile,
  currentUserError,
  currentUserLoading,
  isCurrentUser,
  publicProfileError,
  publicProfileLoading,
  viewerContext,
}: {
  canFetchPublicProfile: boolean;
  currentUserError: boolean;
  currentUserLoading: boolean;
  isCurrentUser: boolean;
  publicProfileError: boolean;
  publicProfileLoading: boolean;
  viewerContext: ViewerProfile["viewerContext"] | undefined;
}): ProfilePanelDataState {
  if (isCurrentUser) {
    if (currentUserLoading) return "loading";
    if (currentUserError) return "error";
    return "ready";
  }

  if (!canFetchPublicProfile) return "ready";
  if (publicProfileLoading) return "loading";
  if (publicProfileError) return "error";

  return viewerContext === "MINIMAL" ? "minimal" : "ready";
}
