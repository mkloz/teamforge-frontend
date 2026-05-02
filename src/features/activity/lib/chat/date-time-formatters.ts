const MINUTE_IN_MS = 1000 * 60;
const HOUR_IN_MS = MINUTE_IN_MS * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;
const COUNTDOWN_WINDOW_MS = DAY_IN_MS * 7;

export function formatDateSeparator(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.floor(
    (today.getTime() - messageDate.getTime()) / DAY_IN_MS,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function formatChatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

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

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / HOUR_IN_MS;
  const diffDays = diffMs / DAY_IN_MS;

  if (diffHours < 1) {
    const mins = Math.floor(diffMs / MINUTE_IN_MS);
    return mins < 1 ? "now" : `${mins}m`;
  }
  if (diffHours < 24) return `${Math.floor(diffHours)}h`;
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatCountdown(isoString: string): string | null {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();

  if (diffMs < 0 || diffMs > COUNTDOWN_WINDOW_MS) return null;

  const diffHours = Math.floor(diffMs / HOUR_IN_MS);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.ceil(diffHours / 24)}d`;
}
