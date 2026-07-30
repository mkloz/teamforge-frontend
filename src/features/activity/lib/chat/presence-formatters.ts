import { getPresenceText } from "@/shared/lib/presence-formatters";
import type { OnlineStatus } from "@/shared/schemas/enums";

export function getStatusText(status: OnlineStatus, lastSeen?: string): string {
  return getPresenceText(status, lastSeen);
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
