import { cn } from "@/shared/lib/utils";
import { MutualGroupsSection, type MutualGroup } from "./mutual-groups-section";
import { ProfilePanelInfo } from "./profile-panel-info";
import { ProfilePanelSettings } from "./profile-panel-settings";
import type {
  UserProfilePanelChat,
  UserProfilePanelParticipant,
} from "./types";

interface UserProfilePanelProps {
  participant?: UserProfilePanelParticipant;
  chat?: UserProfilePanelChat;
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
  const participant =
    propParticipant ||
    chat?.participants?.find(
      (member) =>
        member.user?.id !== "current-user" &&
        member.user?.id !== "user-current",
    )?.user ||
    chat?.participants?.[0]?.user;

  const mutualGroups = propMutualGroups || chat?.mutualGroups || [];
  const isMuted = propIsMuted ?? chat?.isMuted ?? false;
  const isBlocked = propIsBlocked ?? chat?.isBlocked ?? false;

  if (!participant) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <p className="text-sm text-slate-muted">User profile not found</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col flex-1 overflow-y-auto",
        isMobile ? "pb-safe scrollbar-hide" : "scrollbar-thin",
      )}
    >
      <div className="flex-1">
        <ProfilePanelInfo
          participant={participant}
          isMobile={isMobile}
          isDirectChat={isDirectChat}
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
