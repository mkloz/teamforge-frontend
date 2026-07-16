import { UserProfilePanel } from "@/features/activity/components/user-profile-panel";
import type {
  DirectChat,
  GroupMember,
} from "@/features/activity/lib/activity-contract";
import { blockReportedUser } from "@/features/reporting/public/reporting";

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
        groupRole: member.role,
      }
    : undefined;

  return (
    <UserProfilePanel
      allowChatNavigation={false}
      chat={memberChat}
      participant={participant}
      mode={isMobile ? "mobile" : "desktop"}
      scope="group-member"
      safety={{
        onToggleBlock: () => {
          void blockReportedUser(member.userId);
        },
      }}
      onBack={onBack}
    />
  );
}
