import type { Notification } from "@/shared/schemas";

const DAY_IN_MS = 86_400_000;

export type NotificationRecencyGroupKey =
  | "today"
  | "past-week"
  | "past-month"
  | "earlier";

export interface NotificationRecencyGroup {
  key: NotificationRecencyGroupKey;
  label: string;
  items: Notification[];
}

export function groupNotificationsByRecency(
  items: Notification[],
  referenceTime: number,
): NotificationRecencyGroup[] {
  const today: Notification[] = [];
  const pastWeek: Notification[] = [];
  const pastMonth: Notification[] = [];
  const earlier: Notification[] = [];
  const todayStart = getLocalDayStart(referenceTime);
  const pastWeekStart = todayStart - 7 * DAY_IN_MS;
  const pastMonthStart = todayStart - 30 * DAY_IN_MS;

  for (const item of items) {
    const createdAt = new Date(item.createdAt).getTime();

    if (Number.isNaN(createdAt)) {
      earlier.push(item);
      continue;
    }

    if (createdAt >= todayStart) {
      today.push(item);
      continue;
    }

    if (createdAt >= pastWeekStart) {
      pastWeek.push(item);
      continue;
    }

    if (createdAt >= pastMonthStart) {
      pastMonth.push(item);
      continue;
    }

    earlier.push(item);
  }

  return [
    { key: "today", label: "Today", items: today },
    { key: "past-week", label: "Past week", items: pastWeek },
    { key: "past-month", label: "Past month", items: pastMonth },
    { key: "earlier", label: "Earlier", items: earlier },
  ];
}

function getLocalDayStart(timestamp: number) {
  const date = new Date(timestamp);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}
