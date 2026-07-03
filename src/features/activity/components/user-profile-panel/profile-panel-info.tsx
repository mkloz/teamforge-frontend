import { getArchetype } from "@/features/profile/public/profile-archetypes";
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
import type { UserProfilePanelParticipant } from "./types";

interface ProfilePanelInfoProps {
  participant: UserProfilePanelParticipant;
  isHydratingProfile?: boolean;
  chatNavigation?: ReturnType<typeof buildActivityDmNavigation>;
  compactHeaderVisible?: boolean;
  profileNavigation?: ProfileNavigation;
  onBack?: () => void;
  onCompactHeaderClick?: () => void;
}

interface ProfilePanelInfoViewState {
  groupMode: string;
  onlineStatus: OnlineStatus;
  personalitySignals: ShowUpSignal[];
  trustScore: number;
  typeLabel: string;
}

function formatPercent(score: number | null | undefined): number {
  if (typeof score !== "number") {
    return 0;
  }

  return Math.round(score > 0 && score <= 1 ? score * 100 : score);
}

export function ProfilePanelInfo({
  participant,
  isHydratingProfile = false,
  chatNavigation,
  compactHeaderVisible = false,
  profileNavigation,
  onBack,
  onCompactHeaderClick,
}: ProfilePanelInfoProps) {
  const viewState = getProfilePanelInfoViewState(participant);

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
        groupMode={viewState.groupMode}
        onlineStatus={viewState.onlineStatus}
        participant={participant}
        profileNavigation={profileNavigation}
        trustScore={viewState.trustScore}
        typeLabel={viewState.typeLabel}
      />

      <ProfilePanelAboutSection participant={participant} />

      <ProfilePanelSignalsSection
        isHydratingProfile={isHydratingProfile}
        personalitySignals={viewState.personalitySignals}
      />
    </div>
  );
}

function getProfilePanelInfoViewState(
  participant: UserProfilePanelParticipant,
): ProfilePanelInfoViewState {
  const personalityType = participant.personalityType;

  return {
    groupMode: personalityType
      ? getArchetype(personalityType).replace(/^The\s+/i, "")
      : "Open",
    onlineStatus: participant.onlineStatus || "OFFLINE",
    personalitySignals: buildShowUpSignals(participant),
    trustScore: formatPercent(participant.trustScore),
    typeLabel: personalityType ?? "Open",
  };
}
