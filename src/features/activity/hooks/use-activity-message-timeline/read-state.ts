export function getTimelineResumeRefetchResetKey(
  chatId: string | null,
  currentUserId: string | null,
  selectedParticipantCount: number,
) {
  return `${chatId ?? ""}:${currentUserId ?? ""}:${selectedParticipantCount}`;
}
