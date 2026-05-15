import type {
  GroupStatus,
  MemberRole,
} from "@/features/activity/lib/activity-contract";

export function isGroupActionsLocked(groupStatus: GroupStatus) {
  return groupStatus === "DISBANDED";
}

export function canDisbandGroup(
  currentUserRole: MemberRole,
  groupStatus: GroupStatus,
) {
  return currentUserRole === "ADMIN" && !isGroupActionsLocked(groupStatus);
}
