import type { ProfileNavigation } from "@/features/profile/lib/profile-route";
import { type MutualGroup, MutualGroupsSection } from "./mutual-groups-section";
import { ProfilePanelInfo } from "./profile-panel-info";
import {
  getProfilePanelContentState,
  getProfilePanelParticipantCandidate,
  getProfilePanelScrollContainerClassName,
  getProfilePanelScrollResetKey,
  type ProfilePanelContentState,
} from "./profile-panel-render-state";
import { ProfilePanelSettings } from "./profile-panel-settings";
import type {
  UserProfilePanelChat,
  UserProfilePanelParticipant,
} from "./types";
import { useHydratedProfilePanelParticipant } from "./use-hydrated-profile-panel-participant";
import { useProfilePanelViewState } from "./use-profile-panel-view-state";

interface UserProfilePanelProps {
  participant?: UserProfilePanelParticipant;
  chat?: UserProfilePanelChat;
  profileNavigation?: ProfileNavigation;
  mutualGroups?: MutualGroup[];
  mode?: ProfilePanelMode;
  safety?: ProfilePanelSafetyControls;
  scope?: ProfilePanelScope;
  onBack?: () => void;
}

type ProfilePanelMode = "desktop" | "mobile";
type ProfilePanelScope = "direct-chat" | "group-member";

interface ProfilePanelSafetyControls {
  isMuted?: boolean;
  isBlocked?: boolean;
  blockActionDisabled?: boolean;
  isMuteActionDisabled?: boolean;
  blockActionPending?: boolean;
  muteActionPending?: boolean;
  onToggleMute?: () => void;
  onToggleBlock?: () => void;
}

interface ProfilePanelSafetyState {
  isMuted?: boolean;
  isBlocked?: boolean;
  blockActionDisabled: boolean;
  isMuteActionDisabled: boolean;
  blockActionPending: boolean;
  muteActionPending: boolean;
  onToggleMute?: () => void;
  onToggleBlock?: () => void;
}

const DEFAULT_PROFILE_PANEL_SAFETY_CONTROLS: ProfilePanelSafetyControls = {
  blockActionDisabled: false,
  blockActionPending: false,
  isMuteActionDisabled: false,
  muteActionPending: false,
};

export function UserProfilePanel({
  participant: propParticipant,
  chat,
  profileNavigation,
  mutualGroups: propMutualGroups,
  mode = "desktop",
  safety,
  scope = "direct-chat",
  onBack,
}: UserProfilePanelProps) {
  const safetyState = getProfilePanelSafetyState(safety);
  const selectedParticipant = getProfilePanelParticipantCandidate({
    chat,
    participant: propParticipant,
  });
  const { isHydratingProfile, participant } =
    useHydratedProfilePanelParticipant(selectedParticipant);
  const profileScrollResetKey = getProfilePanelScrollResetKey({
    chat,
    participant,
  });
  const {
    handlePanelScroll,
    isCompactHeaderVisible,
    isPanelHeaderCollapsed,
    scrollPanelToTop,
    scrollRef,
  } = useProfilePanelViewState({
    resetEnabled: Boolean(participant?.id || chat?.id),
    resetKey: profileScrollResetKey,
  });

  if (!participant) {
    return <ProfilePanelUnavailableState />;
  }

  const contentState = getProfilePanelContentState({
    chat,
    participant,
    profileNavigation,
    propIsBlocked: safetyState.isBlocked,
    propIsMuted: safetyState.isMuted,
    propMutualGroups,
  });

  return (
    <div
      ref={scrollRef}
      onScroll={handlePanelScroll}
      className={getProfilePanelScrollContainerClassName({
        isCompactHeaderVisible,
        isMobile: mode === "mobile",
        isPanelHeaderCollapsed,
      })}
    >
      <ProfilePanelContent
        contentState={contentState}
        headerState={{
          compactHeaderVisible: isCompactHeaderVisible,
          isHydratingProfile,
          onCompactHeaderClick: scrollPanelToTop,
        }}
        mode={mode}
        onBack={onBack}
        participant={participant}
        safety={safetyState}
        scope={scope}
      />
    </div>
  );
}

function getProfilePanelSafetyState(
  safety = DEFAULT_PROFILE_PANEL_SAFETY_CONTROLS,
): ProfilePanelSafetyState {
  return {
    isMuted: safety.isMuted,
    isBlocked: safety.isBlocked,
    blockActionDisabled: Boolean(safety.blockActionDisabled),
    isMuteActionDisabled: Boolean(safety.isMuteActionDisabled),
    blockActionPending: Boolean(safety.blockActionPending),
    muteActionPending: Boolean(safety.muteActionPending),
    onToggleMute: safety.onToggleMute,
    onToggleBlock: safety.onToggleBlock,
  };
}

function ProfilePanelUnavailableState() {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center">
      <p className="text-slate-muted text-sm">User profile not found</p>
    </div>
  );
}

interface ProfilePanelHeaderState {
  compactHeaderVisible: boolean;
  isHydratingProfile: boolean;
  onCompactHeaderClick: () => void;
}

interface ProfilePanelContentProps {
  contentState: ProfilePanelContentState;
  headerState: ProfilePanelHeaderState;
  mode: ProfilePanelMode;
  onBack?: () => void;
  participant: UserProfilePanelParticipant;
  safety: ProfilePanelSafetyState;
  scope: ProfilePanelScope;
}

function ProfilePanelContent({
  contentState,
  headerState,
  mode,
  onBack,
  participant,
  safety,
  scope,
}: ProfilePanelContentProps) {
  return (
    <div className="flex-1">
      <ProfilePanelInfo
        participant={participant}
        isHydratingProfile={headerState.isHydratingProfile}
        chatNavigation={contentState.chatNavigation}
        compactHeaderVisible={headerState.compactHeaderVisible}
        onCompactHeaderClick={headerState.onCompactHeaderClick}
        profileNavigation={contentState.profileNavigation}
        onBack={onBack}
      />

      <MutualGroupsSection groups={contentState.mutualGroups} />

      <DirectChatSettingsSection
        contentState={contentState}
        mode={mode}
        safety={safety}
        scope={scope}
      />
    </div>
  );
}

interface DirectChatSettingsSectionProps {
  contentState: ProfilePanelContentState;
  mode: ProfilePanelMode;
  safety: ProfilePanelSafetyState;
  scope: ProfilePanelScope;
}

function DirectChatSettingsSection({
  contentState,
  mode,
  safety,
  scope,
}: DirectChatSettingsSectionProps) {
  if (scope !== "direct-chat") {
    return null;
  }

  return (
    <ProfilePanelSettings content={contentState} mode={mode} safety={safety} />
  );
}
