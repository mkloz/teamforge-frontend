import { cn } from "@/shared/lib/utils";
import { ProfilePanelInfo } from "./profile-panel-info";
import { MutualGroupsSection, type MutualGroup } from "./mutual-groups-section";
import { ProfilePanelSettings } from "./profile-panel-settings";
import type { User, Chat } from "@/shared/schemas";

interface UserProfilePanelProps {
  participant?: User;
  chat?: Chat;
  mutualGroups?: MutualGroup[];
  isMuted?: boolean;
  isBlocked?: boolean;
  isMobile?: boolean;
  isDirectChat?: boolean;
  onBack?: () => void;
}

/**
 * UserProfilePanel - Unified content for the user profile side panel.
 */
export function UserProfilePanel({
  participant: propParticipant,
  chat,
  mutualGroups: propMutualGroups,
  isMuted: propIsMuted,
  isBlocked: propIsBlocked,
  isMobile = false,
  isDirectChat = true,
  onBack,
}: UserProfilePanelProps) {
  // Derive participant from chat if not provided
  const participant =
    propParticipant ||
    chat?.participants?.find((p) => p.user?.id !== "current-user")?.user ||
    chat?.participants?.[0]?.user;

  // Derive mutual groups from chat if not provided
  const mutualGroups = propMutualGroups || chat?.mutualGroups || [];

  // Derive settings from chat if not provided
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
      {/* Scrollable area */}
      <div className="flex-1">
        <ProfilePanelInfo
          participant={participant}
          isMobile={isMobile}
          isDirectChat={isDirectChat}
          onBack={onBack}
        />

        <MutualGroupsSection groups={mutualGroups || []} />

        {isDirectChat && (
          <ProfilePanelSettings
            isMuted={isMuted ?? false}
            isBlocked={isBlocked ?? false}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}
