import type { DirectMessage } from "../types/direct-chats.types";

/**
 * formatDateSeparator - formats message timestamps into group separators.
 */
export function formatDateSeparator(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

/**
 * shouldShowDateSeparator - checks if a date header should be rendered.
 */
export function shouldShowDateSeparator(
  current: DirectMessage,
  previous?: DirectMessage,
): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.timestamp).toDateString();
  const previousDate = new Date(previous.timestamp).toDateString();
  return currentDate !== previousDate;
}

/**
 * shouldShowAvatar - checks if a user avatar should be rendered.
 */
export function shouldShowAvatar(
  current: DirectMessage,
  previous?: DirectMessage,
): boolean {
  if (!previous) return true;
  if (current.isOwn !== previous.isOwn) return true;
  // Show avatar if more than 5 minutes between messages
  const timeDiff =
    new Date(current.timestamp).getTime() -
    new Date(previous.timestamp).getTime();
  return timeDiff > 5 * 60 * 1000;
}
