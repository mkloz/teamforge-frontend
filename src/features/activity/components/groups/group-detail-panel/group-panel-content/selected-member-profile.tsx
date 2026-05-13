import { UserProfilePanel } from "@/features/activity/components/user-profile-panel";
import type {
  DirectChat,
  GroupMember,
} from "@/features/activity/lib/activity-contract";

interface SelectedMemberProfileProps {
  isMobile: boolean;
  member: GroupMember;
  memberChat: DirectChat;
  onBack: () => void;
}

export function SelectedMemberProfile({
  isMobile,
  member,
  memberChat,
  onBack,
}: SelectedMemberProfileProps) {
  const participant = member.user
    ? {
        ...member.user,
        compatibilityScore: member.compatibilityScore,
        groupRole: member.role,
      }
    : undefined;

  return (
    <UserProfilePanel
      chat={memberChat}
      participant={participant}
      isMobile={isMobile}
      isDirectChat={false}
      onBack={onBack}
    />
  );
}
