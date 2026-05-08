import { UserProfilePanel } from "@/features/activity/components/user-profile-panel";
import type { DirectChat } from "@/features/activity/lib/activity-contract";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";

interface SelectedMemberProfileProps {
  isMobile: boolean;
  memberChat: DirectChat;
  onBack: () => void;
}

export function SelectedMemberProfile({
  isMobile,
  memberChat,
  onBack,
}: SelectedMemberProfileProps) {
  return (
    <UserProfilePanel
      chat={memberChat}
      profileNavigation={buildProfileNavigation()}
      isMobile={isMobile}
      isDirectChat={false}
      onBack={onBack}
    />
  );
}
