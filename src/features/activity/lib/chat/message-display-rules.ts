import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

const MESSAGE_SEQUENCE_GAP_MS = 5 * 60 * 1000;

function isStandaloneTimelineItem(message: UnifiedMessage) {
  return message.type === "SYSTEM";
}

export function shouldShowDateSeparator(
  current: UnifiedMessage,
  previous?: UnifiedMessage,
): boolean {
  if (!previous) return true;

  const currentDate = new Date(current.createdAt).toDateString();
  const previousDate = new Date(previous.createdAt).toDateString();

  return currentDate !== previousDate;
}

export function shouldShowSenderAnchor(
  current: UnifiedMessage,
  previous?: UnifiedMessage,
): boolean {
  if (isStandaloneTimelineItem(current)) return true;
  if (!previous) return true;
  if (isStandaloneTimelineItem(previous)) return true;
  if (previous.senderId !== current.senderId) return true;

  return getMessageGapMs(previous, current) > MESSAGE_SEQUENCE_GAP_MS;
}

export function shouldShowAvatar(
  current: UnifiedMessage,
  next?: UnifiedMessage,
): boolean {
  if (isStandaloneTimelineItem(current)) return false;
  if (!next) return true;
  if (isStandaloneTimelineItem(next)) return true;
  if (next.senderId !== current.senderId) return true;

  return getMessageGapMs(current, next) > MESSAGE_SEQUENCE_GAP_MS;
}

function getMessageGapMs(left: UnifiedMessage, right: UnifiedMessage) {
  return (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}
