import type { ExploreTimeWindow } from "@/features/explore/schemas/explore-filters.schema";

export function getCustomExploreTimeRange(input: {
  startsAfter: string | null;
  startsBefore: string | null;
}) {
  const start = toLocalDateStart(input.startsAfter);
  const end = toExclusiveLocalDateEnd(input.startsBefore);

  if (!start && !end) {
    return null;
  }

  return { start, end };
}

export function getExploreTimeWindowRange(
  timeWindow: ExploreTimeWindow,
  now = new Date(),
) {
  if (timeWindow === "ALL") {
    return null;
  }

  const todayStart = startOfDay(now);

  switch (timeWindow) {
    case "TODAY": {
      const tomorrowStart = addDays(todayStart, 1);

      return { start: todayStart, end: tomorrowStart };
    }
    case "TOMORROW": {
      const tomorrowStart = addDays(todayStart, 1);
      const nextDayStart = addDays(todayStart, 2);

      return { start: tomorrowStart, end: nextDayStart };
    }
    case "THIS_WEEK":
      return { start: todayStart, end: startOfNextWeek(todayStart) };
    case "THIS_WEEKEND": {
      const weekendStart = startOfNextSaturday(todayStart);
      const weekendEnd = addDays(weekendStart, 2);

      return { start: weekendStart, end: weekendEnd };
    }
  }

  return null;
}

function startOfDay(value: Date) {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
}

function addDays(value: Date, days: number) {
  const date = new Date(value);

  date.setDate(date.getDate() + days);

  return date;
}

function startOfNextWeek(value: Date) {
  const date = startOfDay(value);
  const daysUntilNextMonday = (8 - date.getDay()) % 7 || 7;

  return addDays(date, daysUntilNextMonday);
}

function toLocalDateStart(value: string | null) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map((part) => Number(part));

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
}

function toExclusiveLocalDateEnd(value: string | null) {
  const start = toLocalDateStart(value);

  return start ? addDays(start, 1) : null;
}

function startOfNextSaturday(value: Date) {
  const date = startOfDay(value);
  const daysUntilSaturday = (6 - date.getDay() + 7) % 7;

  return addDays(date, daysUntilSaturday);
}
