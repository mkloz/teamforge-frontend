import type { buildActivityDmNavigation } from "@/shared/navigation/activity-navigation";
import type { ProfileNavigation } from "@/shared/navigation/profile-navigation";
import type { OnlineStatus } from "@/shared/schemas/enums";
import { ProfilePanelOriginalCard } from "./profile-panel-card";
import {
  ProfilePanelBackButton,
  ProfilePanelCover,
} from "./profile-panel-cover";
import {
  ProfilePanelAboutSection,
  ProfilePanelSignalsSection,
} from "./profile-panel-sections";
import { buildShowUpSignals, type ShowUpSignal } from "./show-up-profile";
import type {
  ProfilePanelDataState,
  UserProfilePanelParticipant,
} from "./types";

interface ProfilePanelInfoProps {
  participant: UserProfilePanelParticipant;
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  compactHeaderVisible?: boolean;
  profileState: ProfilePanelDataState;
  profileNavigation?: ProfileNavigation;
  onBack?: () => void;
  onCompactHeaderClick?: () => void;
  onRetryProfile: () => void;
}

interface ProfilePanelInfoViewState {
  onlineStatus?: OnlineStatus;
  personalitySignals: ShowUpSignal[];
  roleLabel?: string;
  typeLabel?: string;
}

export function ProfilePanelInfo({
  participant,
  chatNavigation,
  compactHeaderVisible = false,
  profileState,
  profileNavigation,
  onBack,
  onCompactHeaderClick,
  onRetryProfile,
}: ProfilePanelInfoProps) {
  const viewState = getProfilePanelInfoViewState(participant, profileState);

  return (
    <div className="relative flex w-full flex-col">
      <ProfilePanelCover
        compactHeaderVisible={compactHeaderVisible}
        onlineStatus={viewState.onlineStatus}
        onCompactHeaderClick={onCompactHeaderClick}
        participant={participant}
      />

      <ProfilePanelBackButton onBack={onBack} />

      <ProfilePanelOriginalCard
        chatNavigation={chatNavigation}
        onlineStatus={viewState.onlineStatus}
        participant={participant}
        profileNavigation={profileNavigation}
        roleLabel={viewState.roleLabel}
        typeLabel={viewState.typeLabel}
      />

      <ProfilePanelAboutSection
        onRetry={onRetryProfile}
        participant={participant}
        profileState={profileState}
      />

      <ProfilePanelSignalsSection
        personalitySignals={viewState.personalitySignals}
        profileState={profileState}
      />
    </div>
  );
}

function getProfilePanelInfoViewState(
  participant: UserProfilePanelParticipant,
  profileState: ProfilePanelDataState,
): ProfilePanelInfoViewState {
  const personalityType = participant.personalityType;
  const canShowPersonality = profileState === "ready";

  return {
    onlineStatus: participant.onlineStatus,
    personalitySignals: canShowPersonality
      ? buildShowUpSignals(participant)
      : [],
    roleLabel: formatGroupRole(participant.groupRole),
    typeLabel: canShowPersonality ? (personalityType ?? undefined) : undefined,
  };
}

function formatGroupRole(role: UserProfilePanelParticipant["groupRole"]) {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "MODERATOR":
      return "Moderator";
    case "MEMBER":
      return "Member";
    default:
      return undefined;
  }
}
