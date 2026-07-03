import type { ExploreTimeWindow } from "@/features/explore/schemas/explore-filters.schema";
import {
  isValidLocalDateValue,
  parseLocalDateValue,
} from "@/shared/lib/local-date-value";

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

export function isValidExploreDateValue(value: string | null | undefined) {
  return isValidLocalDateValue(value);
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
  const parsed = parseLocalDateValue(value);

  if (!parsed) {
    return null;
  }

  const date = new Date(parsed.year, parsed.month - 1, parsed.day);

  return date;
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
