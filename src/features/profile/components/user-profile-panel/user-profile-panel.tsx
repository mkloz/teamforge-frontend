import { cn } from "@/shared/lib/utils";
import type { DirectChat } from "@/features/activity/types/direct-chats.types";
import { ProfilePanelInfo } from "./profile-panel-info";
import { MutualGroupsSection } from "./mutual-groups-section";
import { ProfilePanelSettings } from "./profile-panel-settings";
import { CURRENT_USER_ID } from "@/features/activity/data/mock-direct-chats";

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
  // Find the other participant who is not the current user
  // Fallback to the first participant if only one exists (e.g. viewing own profile)
  const participantData =
    chat.participants?.find((p) => p.userId !== CURRENT_USER_ID) ||
    chat.participants?.[0];

  const participant = participantData?.user;
  const { mutualGroups, isMuted, isBlocked } = chat;

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
