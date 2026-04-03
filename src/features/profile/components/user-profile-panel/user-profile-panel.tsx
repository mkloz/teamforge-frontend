import { cn } from "@/shared/lib/utils";
import type { DirectChat } from "@/features/activity/types/direct-chats.types";
import { ProfilePanelInfo } from "./profile-panel-info";
import { MutualGroupsSection } from "./mutual-groups-section";
import { ProfilePanelSettings } from "./profile-panel-settings";

interface UserProfilePanelProps {
  chat: DirectChat;
  isMobile?: boolean;
  isDirectChat?: boolean;
  onBack?: () => void;
}

/**
 * UserProfilePanel - Unified content for the user profile side panel.
 */
export function UserProfilePanel({
  chat,
  isMobile = false,
  isDirectChat = true,
  onBack,
}: UserProfilePanelProps) {
  const { participant, mutualGroups, isMuted, isBlocked } = chat;

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
            isMuted={isMuted}
            isBlocked={isBlocked}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}
