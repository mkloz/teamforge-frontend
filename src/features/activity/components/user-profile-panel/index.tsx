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
  isMuted?: boolean;
  isBlocked?: boolean;
  blockActionDisabled?: boolean;
  isBlockActionPending?: boolean;
  isMuteActionDisabled?: boolean;
  isMuteActionPending?: boolean;
  isMobile?: boolean;
  isDirectChat?: boolean;
  onBack?: () => void;
  onToggleMute?: () => void;
  onToggleBlock?: () => void;
}

export function UserProfilePanel({
  participant: propParticipant,
  chat,
  profileNavigation,
  mutualGroups: propMutualGroups,
  isMuted: propIsMuted,
  isBlocked: propIsBlocked,
  blockActionDisabled = false,
  isBlockActionPending = false,
  isMuteActionDisabled = false,
  isMuteActionPending = false,
  isMobile = false,
  isDirectChat = true,
  onBack,
  onToggleMute,
  onToggleBlock,
}: UserProfilePanelProps) {
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
    propIsBlocked,
    propIsMuted,
    propMutualGroups,
  });

  return (
    <div
      ref={scrollRef}
      onScroll={handlePanelScroll}
      className={getProfilePanelScrollContainerClassName({
        isCompactHeaderVisible,
        isMobile,
        isPanelHeaderCollapsed,
      })}
    >
      <ProfilePanelContent
        blockActionDisabled={blockActionDisabled}
        compactHeaderVisible={isCompactHeaderVisible}
        contentState={contentState}
        isBlockActionPending={isBlockActionPending}
        isDirectChat={isDirectChat}
        isHydratingProfile={isHydratingProfile}
        isMobile={isMobile}
        isMuteActionDisabled={isMuteActionDisabled}
        isMuteActionPending={isMuteActionPending}
        onBack={onBack}
        onCompactHeaderClick={scrollPanelToTop}
        onToggleBlock={onToggleBlock}
        onToggleMute={onToggleMute}
        participant={participant}
      />
    </div>
  );
}

function ProfilePanelUnavailableState() {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center">
      <p className="text-slate-muted text-sm">User profile not found</p>
    </div>
  );
}

interface ProfilePanelContentProps
  extends Pick<
    UserProfilePanelProps,
    | "blockActionDisabled"
    | "isBlockActionPending"
    | "isDirectChat"
    | "isMobile"
    | "isMuteActionDisabled"
    | "isMuteActionPending"
    | "onBack"
    | "onToggleBlock"
    | "onToggleMute"
  > {
  compactHeaderVisible: boolean;
  contentState: ProfilePanelContentState;
  isHydratingProfile: boolean;
  onCompactHeaderClick: () => void;
  participant: UserProfilePanelParticipant;
}

function ProfilePanelContent({
  blockActionDisabled,
  compactHeaderVisible,
  contentState,
  isBlockActionPending,
  isDirectChat,
  isHydratingProfile,
  isMobile,
  isMuteActionDisabled,
  isMuteActionPending,
  onBack,
  onCompactHeaderClick,
  onToggleBlock,
  onToggleMute,
  participant,
}: ProfilePanelContentProps) {
  return (
    <div className="flex-1">
      <ProfilePanelInfo
        participant={participant}
        isHydratingProfile={isHydratingProfile}
        chatNavigation={contentState.chatNavigation}
        compactHeaderVisible={compactHeaderVisible}
        onCompactHeaderClick={onCompactHeaderClick}
        profileNavigation={contentState.profileNavigation}
        onBack={onBack}
      />

      <MutualGroupsSection groups={contentState.mutualGroups} />

      <DirectChatSettingsSection
        blockActionDisabled={blockActionDisabled}
        contentState={contentState}
        isBlockActionPending={isBlockActionPending}
        isDirectChat={isDirectChat}
        isMobile={isMobile}
        isMuteActionDisabled={isMuteActionDisabled}
        isMuteActionPending={isMuteActionPending}
        onToggleBlock={onToggleBlock}
        onToggleMute={onToggleMute}
      />
    </div>
  );
}

interface DirectChatSettingsSectionProps
  extends Pick<
    UserProfilePanelProps,
    | "blockActionDisabled"
    | "isBlockActionPending"
    | "isDirectChat"
    | "isMobile"
    | "isMuteActionDisabled"
    | "isMuteActionPending"
    | "onToggleBlock"
    | "onToggleMute"
  > {
  contentState: ProfilePanelContentState;
}

function DirectChatSettingsSection({
  blockActionDisabled,
  contentState,
  isBlockActionPending,
  isDirectChat,
  isMobile,
  isMuteActionDisabled,
  isMuteActionPending,
  onToggleBlock,
  onToggleMute,
}: DirectChatSettingsSectionProps) {
  if (!isDirectChat) {
    return null;
  }

  return (
    <ProfilePanelSettings
      isMuted={contentState.isMuted}
      isBlocked={contentState.isBlocked}
      blockActionDisabled={blockActionDisabled}
      isBlockActionPending={isBlockActionPending}
      isMuteActionDisabled={isMuteActionDisabled}
      isMuteActionPending={isMuteActionPending}
      isMobile={isMobile}
      onToggleMute={onToggleMute}
      onToggleBlock={onToggleBlock}
    />
  );
}
