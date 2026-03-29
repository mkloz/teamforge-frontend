import { cn } from "@/shared/lib/utils";
import type { DirectChat } from "@/features/activity/types/direct-chats.types";
import { ProfilePanelInfo } from "./profile-panel-info";
import { MutualGroupsSection } from "./mutual-groups-section";
import { ProfilePanelSettings } from "./profile-panel-settings";

interface ProfilePanelContentProps {
  chat: DirectChat;
  isMobile?: boolean;
}

/**
 * ProfilePanelContent - Unified content for the user profile side panel/sheet.
 * Shares logic and structure between desktop and mobile.
 */
export function ProfilePanelContent({
  chat,
  isMobile = false,
}: ProfilePanelContentProps) {
  const { participant, mutualGroups, isMuted, isBlocked } = chat;

  return (
    <div
      className={cn(
        "flex flex-col flex-1",
        isMobile ? "pb-safe" : "overflow-y-auto scrollbar-thin",
      )}
    >
      {/* Scrollable area */}
      <div className="flex-1">
        <ProfilePanelInfo participant={participant} isMobile={isMobile} />

        {/* Bio Section */}
        {participant.bio && (
          <div className="p-4 border-b border-border">
            <h4 className="text-[11px] font-bold text-slate-muted uppercase tracking-wider mb-2">
              About
            </h4>
            <p className="text-sm text-ink leading-relaxed font-medium">
              {participant.bio}
            </p>
          </div>
        )}

        <MutualGroupsSection groups={mutualGroups || []} isMobile={isMobile} />

        <ProfilePanelSettings
          isMuted={isMuted}
          isBlocked={isBlocked}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
