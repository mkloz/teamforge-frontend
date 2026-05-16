import { isLegacyActivityCurrentUserId } from "@/features/activity/lib/activity-identities";

export function isMessageFromCurrentUser(
  senderId: string,
  senderSummaryId: string | undefined,
  currentUserId: string | null,
): boolean {
  if (
    isLegacyActivityCurrentUserId(senderId) ||
    isLegacyActivityCurrentUserId(senderSummaryId)
  ) {
    return true;
  }

  return (
    currentUserId !== null &&
    (senderId === currentUserId || senderSummaryId === currentUserId)
  );
}
