import type { OnlineStatus } from "@/shared/schemas/enums";
import type { UnifiedMessage } from "../types/chat.types";

/**
 * getStatusText - maps online status and last seen to a readable string.
 */
export function getStatusText(status: OnlineStatus, lastSeen?: string): string {
  switch (status) {
    case "ONLINE":
      return "Online";
    case "AWAY":
      return "Away";
    case "OFFLINE":
      if (lastSeen) {
        const date = new Date(lastSeen);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `Last seen ${diffMins}m ago`;
        if (diffHours < 24) return `Last seen ${diffHours}h ago`;
        if (diffDays === 1) return "Last seen yesterday";
        return `Last seen ${diffDays}d ago`;
      }
      return "Offline";
  }
}

/**
 * formatDateSeparator - formats message timestamps into group separators.
 */
export function formatDateSeparator(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  // Reset hours to compare dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffTime = today.getTime() - messageDate.getTime();
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
  current: UnifiedMessage,
  previous?: UnifiedMessage,
): boolean {
  if (!previous) return true;
  const currentDate = new Date(current.createdAt).toDateString();
  const previousDate = new Date(previous.createdAt).toDateString();
  return currentDate !== previousDate;
}

/**
 * shouldShowSenderAnchor - checks if sender name/avatar should be shown for a message.
 */
export function shouldShowSenderAnchor(
  current: UnifiedMessage,
  previous?: UnifiedMessage,
): boolean {
  if (current.type === "SYSTEM") return false;
  if (!previous) return true;
  if (previous.type === "SYSTEM") return true;
  if (previous.senderId !== current.senderId) return true;

  // Show sender anchor if more than 5 minutes between messages
  const timeDiff =
    new Date(current.createdAt).getTime() -
    new Date(previous.createdAt).getTime();
  return timeDiff > 5 * 60 * 1000;
}

/**
 * shouldShowAvatar - checks if avatar should be shown (last in a sequence from same sender)
 */
export function shouldShowAvatar(
  current: UnifiedMessage,
  next?: UnifiedMessage,
): boolean {
  if (current.type === "SYSTEM") return false;
  if (!next) return true;
  if (next.type === "SYSTEM") return true;
  if (next.senderId !== current.senderId) return true;

  // Show avatar if more than 5 minutes between messages
  const timeDiff =
    new Date(next.createdAt).getTime() - new Date(current.createdAt).getTime();
  return timeDiff > 5 * 60 * 1000;
}

/**
 * formatChatTime - formats timestamps for message bubbles.
 */
export function formatChatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * formatChatFullDate - formats timestamps for status bars.
 */
export function formatChatFullDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * formatFileSize - formats bytes into human readable string.
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * formatRelativeTime - Returns a short, relative time string (e.g., "now", "5m", "Tue", "Mar 20").
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return mins < 1 ? "now" : `${mins}m`;
  }
  if (diffHours < 24) return `${Math.floor(diffHours)}h`;
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * formatCountdown - Returns a short countdown for future events (e.g., "5h", "2d").
 */
export function formatCountdown(isoString: string): string | null {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs < 0 || diffMs > 7 * 24 * 60 * 60 * 1000) return null;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.ceil(diffHours / 24)}d`;
}

/**
 * formatTypingText - Generates a readable string for typing status.
 */
export function formatTypingText(
  users: { fullName: string }[],
  isGroup: boolean,
): string | undefined {
  if (users.length === 0) return undefined;

  if (isGroup) {
    if (users.length === 1) return `${users[0].fullName} is typing`;
    if (users.length === 2)
      return `${users[0].fullName} and ${users[1].fullName} are typing`;
    return `${users[0].fullName} and ${users.length - 1} others are typing`;
  }

  return "typing";
}

/**
 * getSystemMessageConfig - Categorizes system messages for consistent styling/icons.
 */
export function getSystemMessageConfig(content: string) {
  const normalized = content.toLowerCase();

  if (
    normalized.includes("ready") ||
    normalized.includes("formed") ||
    normalized.includes("confirmed")
  ) {
    return { type: "positive" as const };
  }

  if (normalized.includes("joined") || normalized.includes("left")) {
    return { type: "user-event" as const };
  }

  return { type: "info" as const };
}

/**
 * extractFirstUrl - Returns the first http/https URL found in a string,
 * or null if none is found. Used to drive link preview rendering.
 */
const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/;

export function extractFirstUrl(text: string): string | null {
  const match = text.match(URL_REGEX);
  return match ? match[0] : null;
}
