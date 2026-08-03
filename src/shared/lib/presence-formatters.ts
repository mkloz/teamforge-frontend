import type { OnlineStatus } from "@/shared/schemas/enums";

const MINUTE_IN_MS = 60_000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;

export function getPresenceText(
  status: OnlineStatus,
  lastSeenAt?: string | null,
  now = new Date(),
) {
  if (status === "ONLINE") {
    return "Online";
  }

  if (status === "AWAY") {
    return "Away";
  }

  return formatLastSeen(lastSeenAt, now);
}

export function getProjectedPresenceText(
  label?: "HIDDEN" | "LONG_AGO" | "ONLINE" | "RECENTLY" | "THIS_WEEK" | "TODAY",
) {
  if (!label) return null;
  return {
    HIDDEN: "Last seen hidden",
    LONG_AGO: "Last seen a while ago",
    ONLINE: "Online",
    RECENTLY: "Seen recently",
    THIS_WEEK: "Seen this week",
    TODAY: "Seen today",
  }[label];
}

export function formatLastSeen(lastSeenAt?: string | null, now = new Date()) {
  if (!lastSeenAt) {
    return "Offline";
  }

  const lastSeen = new Date(lastSeenAt);
  if (Number.isNaN(lastSeen.getTime())) {
    return "Offline";
  }

  const elapsed = Math.max(0, now.getTime() - lastSeen.getTime());
  if (elapsed < MINUTE_IN_MS) {
    return "Last seen just now";
  }

  if (isSameCalendarDay(lastSeen, now)) {
    const elapsedMinutes = Math.floor(elapsed / MINUTE_IN_MS);
    if (elapsedMinutes < 60) {
      return `Last seen ${elapsedMinutes} min ago`;
    }

    const elapsedHours = Math.floor(elapsed / HOUR_IN_MS);
    return `Last seen ${elapsedHours} hr ago`;
  }

  if (isYesterday(lastSeen, now)) {
    return `Last seen yesterday at ${formatTime(lastSeen)}`;
  }

  const sameYear = lastSeen.getFullYear() === now.getFullYear();
  return `Last seen ${lastSeen.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  })}`;
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function isYesterday(date: Date, now: Date) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return isSameCalendarDay(date, yesterday);
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
