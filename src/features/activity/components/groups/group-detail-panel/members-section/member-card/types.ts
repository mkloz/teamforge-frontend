import type { GroupMember } from "@/features/activity/lib/activity-contract";

export interface MemberCardProps {
  canRemove?: boolean;
  isViewer?: boolean;
  member: GroupMember;
  onRemove?: (memberId: string) => Promise<void> | void;
  onShowProfile?: (member: GroupMember) => void;
  removing?: boolean;
}
