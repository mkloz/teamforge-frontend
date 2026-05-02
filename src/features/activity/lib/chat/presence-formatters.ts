import type { OnlineStatus } from "@/shared/schemas/enums";

const MINUTE_IN_MS = 1000 * 60;
const HOUR_IN_MS = MINUTE_IN_MS * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;

export function getStatusText(status: OnlineStatus, lastSeen?: string): string {
  switch (status) {
    case "ONLINE":
      return "Online";
    case "AWAY":
      return "Away";
    case "OFFLINE":
      return lastSeen ? formatLastSeen(lastSeen) : "Offline";
  }
}

export function formatTypingText(
  users: { name: string }[],
  isGroup: boolean,
): string | undefined {
  if (users.length === 0) return undefined;

  if (isGroup) {
    if (users.length === 1) return `${users[0].name} is typing`;
    if (users.length === 2)
      return `${users[0].name} and ${users[1].name} are typing`;
    return `${users[0].name} and ${users.length - 1} others are typing`;
  }

  return "typing";
}

function formatLastSeen(lastSeen: string) {
  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / MINUTE_IN_MS);
  const diffHours = Math.floor(diffMs / HOUR_IN_MS);
  const diffDays = Math.floor(diffMs / DAY_IN_MS);

  if (diffMins < 60) return `Last seen ${diffMins}m ago`;
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;
  if (diffDays === 1) return "Last seen yesterday";
  return `Last seen ${diffDays}d ago`;
}
