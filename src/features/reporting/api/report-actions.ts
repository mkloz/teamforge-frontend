import { blockUser } from "@/shared/api/friendship-membership-api";
import { leaveGroup } from "@/shared/api/group-membership-api";
import { refreshAccessSensitiveSurfaces } from "@/shared/api/query-invalidation";

export async function blockReportedUser(userId: string) {
  const result = await blockUser(userId);
  await refreshAccessSensitiveSurfaces();
  return result;
}

export async function leaveReportedGroup(groupId: string) {
  const result = await leaveGroup(groupId);
  await refreshAccessSensitiveSurfaces();
  return result;
}
