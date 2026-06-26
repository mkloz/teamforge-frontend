import type { Notification } from "@/shared/schemas";

const DAY_IN_MS = 86_400_000;

export type NotificationRecencyGroupKey =
  | "today"
  | "past-week"
  | "past-month"
  | "earlier";

const NOTIFICATION_RECENCY_GROUPS = [
  { key: "today", label: "Today", daysAgo: 0 },
  { key: "past-week", label: "Past week", daysAgo: 7 },
  { key: "past-month", label: "Past month", daysAgo: 30 },
] as const satisfies readonly {
  key: Exclude<NotificationRecencyGroupKey, "earlier">;
  label: string;
  daysAgo: number;
}[];

const EARLIER_RECENCY_GROUP = {
  key: "earlier",
  label: "Earlier",
} as const;

export interface NotificationRecencyGroup {
  key: NotificationRecencyGroupKey;
  label: string;
  items: Notification[];
}

export function groupNotificationsByRecency(
  items: Notification[],
  referenceTime: number,
): NotificationRecencyGroup[] {
  const todayStart = getLocalDayStart(referenceTime);
  const groups = createEmptyRecencyGroups();

  for (const item of items) {
    const createdAt = new Date(item.createdAt).getTime();
    const groupKey = getRecencyGroupKey(createdAt, todayStart);

    groups[groupKey].items.push(item);
  }

  return Object.values(groups);
}

function getLocalDayStart(timestamp: number) {
  const date = new Date(timestamp);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function createEmptyRecencyGroups() {
  return {
    today: createRecencyGroup("today", "Today"),
    "past-week": createRecencyGroup("past-week", "Past week"),
    "past-month": createRecencyGroup("past-month", "Past month"),
    earlier: createRecencyGroup(
      EARLIER_RECENCY_GROUP.key,
      EARLIER_RECENCY_GROUP.label,
    ),
  };
}

function getRecencyGroupKey(
  createdAt: number,
  todayStart: number,
): NotificationRecencyGroupKey {
  if (Number.isNaN(createdAt)) {
    return EARLIER_RECENCY_GROUP.key;
  }

  return (
    NOTIFICATION_RECENCY_GROUPS.find(
      (group) => createdAt >= todayStart - group.daysAgo * DAY_IN_MS,
    )?.key ?? EARLIER_RECENCY_GROUP.key
  );
}

function createRecencyGroup(
  key: NotificationRecencyGroupKey,
  label: string,
): NotificationRecencyGroup {
  return { key, label, items: [] };
}
