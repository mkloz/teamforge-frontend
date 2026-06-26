import type { PlannedGroup } from "@/features/home/lib/home-contract";

export function getPlanTimingLabel(plan: PlannedGroup["plan"]) {
  const meta = getDateMeta(plan.dateTime);

  if (!meta) {
    return "Time open";
  }

  const time = formatPlanClockTime(meta.date);

  if (meta.isToday) {
    return `Today at ${time}`;
  }

  if (meta.isTomorrow) {
    return `Tomorrow at ${time}`;
  }

  if (isPlanWithinNextWeek(meta.dayDiff)) {
    return formatPlanWeekdayTime(meta.date);
  }

  return formatPlanCalendarTime(meta.date);
}

export function getDateMeta(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);

  const dayDiff = Math.round(
    (startOfDate.getTime() - startOfToday.getTime()) / 86_400_000,
  );

  return {
    date,
    dayDiff,
    isPast: date.getTime() < now.getTime(),
    isToday: dayDiff === 0,
    isTomorrow: dayDiff === 1,
  };
}

export function sortPlansByUrgency(plans: PlannedGroup[]) {
  return [...plans].sort(
    (left, right) => getPlanUrgency(left) - getPlanUrgency(right),
  );
}

export function getHeroPlanSignal(plan: PlannedGroup["plan"]) {
  const meta = getDateMeta(plan.dateTime);

  if (!meta) {
    return "Time still open";
  }

  if (meta.isPast && meta.isToday) {
    return "Started today";
  }

  if (meta.isPast) {
    return "Needs a check";
  }

  return getPlanTimingLabel(plan);
}

function formatPlanClockTime(date: Date) {
  return date.toLocaleString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatPlanWeekdayTime(date: Date) {
  return date.toLocaleString("en-GB", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatPlanCalendarTime(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isPlanWithinNextWeek(dayDiff: number) {
  return dayDiff > 1 && dayDiff < 7;
}

function getPlanUrgency(group: PlannedGroup) {
  const meta = getDateMeta(group.plan.dateTime);

  if (!meta) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.abs(meta.date.getTime() - Date.now());
}
