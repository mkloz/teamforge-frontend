import { buildActivityDmNavigation } from "@/features/activity/lib/activity-route";
import {
  buildProfileNavigation,
  type ProfileNavigation,
} from "@/features/profile/lib/profile-route";
import { cn } from "@/shared/lib/utils";
import type { MutualGroup } from "./mutual-groups-section";
import type {
  UserProfilePanelChat,
  UserProfilePanelChatParticipant,
  UserProfilePanelParticipant,
} from "./types";

interface ProfilePanelParticipantCandidateInput {
  chat?: UserProfilePanelChat;
  participant?: UserProfilePanelParticipant;
}

interface ProfilePanelContentStateInput {
  chat?: UserProfilePanelChat;
  participant: UserProfilePanelParticipant;
  profileNavigation?: ProfileNavigation;
  propIsBlocked?: boolean;
  propIsMuted?: boolean;
  propMutualGroups?: MutualGroup[];
}

interface ProfilePanelScrollClassNameInput {
  isCompactHeaderVisible: boolean;
  isMobile: boolean;
  isPanelHeaderCollapsed: boolean;
}

type ProfilePanelParticipantCandidate = UserProfilePanelParticipant | undefined;

export interface ProfilePanelContentState {
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  isBlocked: boolean;
  isMuted: boolean;
  mutualGroups: MutualGroup[];
  profileNavigation: ProfileNavigation;
}

export function getProfilePanelParticipantCandidate({
  chat,
  participant,
}: ProfilePanelParticipantCandidateInput): ProfilePanelParticipantCandidate {
  if (participant) {
    return participant;
  }

  return (
    chat?.participants?.find(isNotCurrentUserPlaceholder)?.user ||
    chat?.participants?.[0]?.user
  );
}

export function getProfilePanelScrollResetKey({
  chat,
  participant,
}: {
  chat?: UserProfilePanelChat;
  participant?: UserProfilePanelParticipant;
}): string {
  return participant?.id ?? chat?.id ?? "missing-profile";
}

export function getProfilePanelContentState({
  chat,
  participant,
  profileNavigation,
  propIsBlocked,
  propIsMuted,
  propMutualGroups,
}: ProfilePanelContentStateInput): ProfilePanelContentState {
  return {
    chatNavigation: chat?.id ? buildActivityDmNavigation(chat.id) : undefined,
    isBlocked: propIsBlocked ?? chat?.isBlocked ?? false,
    isMuted: propIsMuted ?? chat?.isMuted ?? false,
    mutualGroups: propMutualGroups || chat?.mutualGroups || [],
    profileNavigation:
      profileNavigation ?? buildProfileNavigation(participant.id),
  };
}

export function getProfilePanelScrollContainerClassName({
  isCompactHeaderVisible,
  isMobile,
  isPanelHeaderCollapsed,
}: ProfilePanelScrollClassNameInput): string {
  return cn(
    "relative flex min-h-0 flex-1 flex-col overflow-y-auto [--panel-cover-expanded-height:136px]",
    isPanelHeaderCollapsed
      ? "[--panel-cover-y:-64px] [--personality-cover-type-opacity:0.22] [--personality-cover-type-scale:0.48] [--personality-cover-type-y:-32px]"
      : "[--panel-cover-y:0px] [--personality-cover-type-opacity:0.82] [--personality-cover-type-scale:1] [--personality-cover-type-y:0px]",
    isCompactHeaderVisible
      ? "[--profile-panel-original-opacity:0] [--profile-panel-original-pointer-events:none]"
      : "[--profile-panel-original-opacity:1] [--profile-panel-original-pointer-events:auto]",
    isMobile
      ? "scrollbar-hide pb-6"
      : "scrollbar-thin [scrollbar-color:var(--muted-foreground)_transparent]",
  );
}

function isNotCurrentUserPlaceholder({
  user,
}: UserProfilePanelChatParticipant) {
  return user?.id !== "current-user" && user?.id !== "user-current";
}
