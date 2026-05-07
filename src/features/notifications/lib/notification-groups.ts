import type { Notification } from "@/shared/schemas";

const DAY_IN_MS = 86_400_000;

export function groupNotificationsByRecency(
  items: Notification[],
  referenceTime: number,
) {
  const today: Notification[] = [];
  const earlier: Notification[] = [];

  for (const item of items) {
    const age = referenceTime - new Date(item.createdAt).getTime();

    if (age < DAY_IN_MS) {
      today.push(item);
    } else {
      earlier.push(item);
    }
  }

  return {
    today,
    earlier,
  };
}
