import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

const MESSAGE_SEQUENCE_GAP_MS = 5 * 60 * 1000;

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
  if (current.type === "SYSTEM") return false;
  if (!previous) return true;
  if (previous.type === "SYSTEM") return true;
  if (previous.senderId !== current.senderId) return true;

  return getMessageGapMs(previous, current) > MESSAGE_SEQUENCE_GAP_MS;
}

export function shouldShowAvatar(
  current: UnifiedMessage,
  next?: UnifiedMessage,
): boolean {
  if (current.type === "SYSTEM") return false;
  if (!next) return true;
  if (next.type === "SYSTEM") return true;
  if (next.senderId !== current.senderId) return true;

  return getMessageGapMs(current, next) > MESSAGE_SEQUENCE_GAP_MS;
}

function getMessageGapMs(left: UnifiedMessage, right: UnifiedMessage) {
  return (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}
