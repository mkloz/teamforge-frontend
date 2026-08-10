import { cn } from "@/shared/lib/utils";
import { buildActivityDmNavigation } from "@/shared/navigation/activity-navigation";
import {
  buildProfileNavigation,
  type ProfileNavigation,
} from "@/shared/navigation/profile-navigation";
import type { MutualGroup } from "./mutual-groups-section";
import type {
  UserProfilePanelChat,
  UserProfilePanelParticipant,
} from "./types";

interface ProfilePanelParticipantCandidateInput {
  chat?: UserProfilePanelChat;
  participant?: UserProfilePanelParticipant;
}

interface ProfilePanelContentStateInput {
  allowChatNavigation?: boolean;
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
    chat?.participants?.find((candidate) => candidate.user)?.user ||
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
  allowChatNavigation = true,
  chat,
  participant,
  profileNavigation,
  propIsBlocked,
  propIsMuted,
  propMutualGroups,
}: ProfilePanelContentStateInput): ProfilePanelContentState {
  return {
    chatNavigation: allowChatNavigation ? getChatNavigation(chat) : undefined,
    isBlocked: getProfilePanelFlag(propIsBlocked, chat?.isBlocked),
    isMuted: getProfilePanelFlag(propIsMuted, chat?.isMuted),
    mutualGroups: getMutualGroups(propMutualGroups, chat),
    profileNavigation: getProfileNavigation(profileNavigation, participant),
  };
}

function getChatNavigation(chat: UserProfilePanelChat | undefined) {
  return chat?.id ? buildActivityDmNavigation(chat.id) : undefined;
}

function getProfilePanelFlag(
  propValue: boolean | undefined,
  chatValue: boolean | undefined,
) {
  return propValue ?? chatValue ?? false;
}

function getMutualGroups(
  propMutualGroups: MutualGroup[] | undefined,
  chat: UserProfilePanelChat | undefined,
) {
  return propMutualGroups || chat?.mutualGroups || [];
}

function getProfileNavigation(
  profileNavigation: ProfileNavigation | undefined,
  participant: UserProfilePanelParticipant,
) {
  return profileNavigation ?? buildProfileNavigation(participant.id);
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
