export function isMessageFromCurrentUser(
  senderId: string,
  senderSummaryId: string | undefined,
  currentUserId: string | null,
): boolean {
  return (
    currentUserId !== null &&
    (senderId === currentUserId || senderSummaryId === currentUserId)
  );
}
