import { buildActivityDmNavigation } from "@/features/activity/lib/activity-route";
import {
  buildProfileNavigation,
  type ProfileNavigation,
} from "@/features/profile/lib/profile-route";
import { cn } from "@/shared/lib/utils";
import { type MutualGroup, MutualGroupsSection } from "./mutual-groups-section";
import { ProfilePanelInfo } from "./profile-panel-info";
import { ProfilePanelSettings } from "./profile-panel-settings";
import type {
  UserProfilePanelChat,
  UserProfilePanelParticipant,
} from "./types";
import { useHydratedProfilePanelParticipant } from "./use-hydrated-profile-panel-participant";

interface UserProfilePanelProps {
  participant?: UserProfilePanelParticipant;
  chat?: UserProfilePanelChat;
  profileNavigation?: ProfileNavigation;
  mutualGroups?: MutualGroup[];
  isMuted?: boolean;
  isBlocked?: boolean;
  blockActionDisabled?: boolean;
  isBlockActionPending?: boolean;
  isMobile?: boolean;
  isDirectChat?: boolean;
  onBack?: () => void;
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
  isMobile = false,
  isDirectChat = true,
  onBack,
  onToggleBlock,
}: UserProfilePanelProps) {
  const selectedParticipant =
    propParticipant ||
    chat?.participants?.find(
      (member) =>
        member.user?.id !== "current-user" &&
        member.user?.id !== "user-current",
    )?.user ||
    chat?.participants?.[0]?.user;
  const { isHydratingProfile, participant } =
    useHydratedProfilePanelParticipant(selectedParticipant);

  const mutualGroups = propMutualGroups || chat?.mutualGroups || [];
  const isMuted = propIsMuted ?? chat?.isMuted ?? false;
  const isBlocked = propIsBlocked ?? chat?.isBlocked ?? false;

  if (!participant) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <p className="text-slate-muted text-sm">User profile not found</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-1 flex-col overflow-y-auto",
        isMobile ? "scrollbar-hide pb-6" : "scrollbar-thin",
      )}
    >
      <div className="flex-1">
        <ProfilePanelInfo
          participant={participant}
          isHydratingProfile={isHydratingProfile}
          chatNavigation={
            chat?.id ? buildActivityDmNavigation(chat.id) : undefined
          }
          profileNavigation={
            profileNavigation ?? buildProfileNavigation(participant.id)
          }
          onBack={onBack}
        />

        <MutualGroupsSection groups={mutualGroups} />

        {isDirectChat && (
          <ProfilePanelSettings
            isMuted={isMuted}
            isBlocked={isBlocked}
            blockActionDisabled={blockActionDisabled}
            isBlockActionPending={isBlockActionPending}
            isMobile={isMobile}
            onToggleBlock={onToggleBlock}
          />
        )}
      </div>
    </div>
  );
}
