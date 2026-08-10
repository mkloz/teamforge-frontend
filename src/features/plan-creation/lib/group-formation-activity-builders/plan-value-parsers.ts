import type { AutomaticGroupFormationExecutionInput } from "@/features/plan-creation/lib/group-formation-execution-schema";

import { parsePositiveCostAmount } from "./cost-amount-parser";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;
const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;
const MAX_TIMEZONE_OFFSET_MINUTES = 14 * 60;

export interface BuildDateTimeOptions {
  /**
   * Same sign convention as Date#getTimezoneOffset:
   * UTC+02:00 is -120, UTC-05:00 is 300.
   * Omit to interpret the date-time in the browser's local timezone.
   */
  timezoneOffsetMinutes?: number;
}

export function buildDateTime(
  planDate: string,
  planTime: string,
  options: BuildDateTimeOptions = {},
) {
  const dateParts = parseDateParts(planDate);
  const timeParts = parseTimeParts(planTime);

  if (!dateParts || !timeParts || !isValidCalendarDate(dateParts)) {
    throw new Error("Invalid planCreation plan date-time");
  }

  const timestamp =
    options.timezoneOffsetMinutes === undefined
      ? buildLocalDate(dateParts, timeParts)
      : buildOffsetDate(dateParts, timeParts, options.timezoneOffsetMinutes);

  if (!timestamp) {
    throw new Error("Invalid planCreation plan date-time");
  }

  return timestamp.toISOString();
}

export function getCoordinatePair(
  lat: number | null | undefined,
  lng: number | null | undefined,
) {
  return isValidLatitude(lat) && isValidLongitude(lng) ? { lat, lng } : null;
}

export function parseCostAmount(input: AutomaticGroupFormationExecutionInput) {
  if (input.planCost !== "PAID") {
    return null;
  }

  return parsePositiveCostAmount(input.planCostAmount);
}

function parseDateParts(value: string) {
  const match = DATE_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;

  if (!yearText || !monthText || !dayText) {
    return null;
  }

  return {
    day: Number(dayText),
    month: Number(monthText),
    year: Number(yearText),
  };
}

function parseTimeParts(value: string) {
  const match = TIME_PATTERN.exec(value);

  if (!match) {
    return null;
  }

  const [, hoursText, minutesText] = match;

  if (!hoursText || !minutesText) {
    return null;
  }

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

function buildLocalDate(
  dateParts: NonNullable<ReturnType<typeof parseDateParts>>,
  timeParts: NonNullable<ReturnType<typeof parseTimeParts>>,
) {
  const timestamp = new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hours,
    timeParts.minutes,
  );

  return hasLocalDateTimeParts(timestamp, dateParts, timeParts)
    ? timestamp
    : null;
}

function buildOffsetDate(
  dateParts: NonNullable<ReturnType<typeof parseDateParts>>,
  timeParts: NonNullable<ReturnType<typeof parseTimeParts>>,
  timezoneOffsetMinutes: number,
) {
  if (!isValidTimezoneOffset(timezoneOffsetMinutes)) {
    return null;
  }

  return new Date(
    Date.UTC(
      dateParts.year,
      dateParts.month - 1,
      dateParts.day,
      timeParts.hours,
      timeParts.minutes,
    ) +
      timezoneOffsetMinutes * 60_000,
  );
}

function isValidCalendarDate(
  dateParts: NonNullable<ReturnType<typeof parseDateParts>>,
) {
  const timestamp = new Date(
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day),
  );

  return (
    timestamp.getUTCFullYear() === dateParts.year &&
    timestamp.getUTCMonth() === dateParts.month - 1 &&
    timestamp.getUTCDate() === dateParts.day
  );
}

function hasLocalDateTimeParts(
  timestamp: Date,
  dateParts: NonNullable<ReturnType<typeof parseDateParts>>,
  timeParts: NonNullable<ReturnType<typeof parseTimeParts>>,
) {
  return (
    !Number.isNaN(timestamp.getTime()) &&
    timestamp.getFullYear() === dateParts.year &&
    timestamp.getMonth() === dateParts.month - 1 &&
    timestamp.getDate() === dateParts.day &&
    timestamp.getHours() === timeParts.hours &&
    timestamp.getMinutes() === timeParts.minutes
  );
}

function isValidTimezoneOffset(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    Math.abs(value) <= MAX_TIMEZONE_OFFSET_MINUTES
  );
}

function isValidLatitude(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= MIN_LATITUDE &&
    value <= MAX_LATITUDE
  );
}

function isValidLongitude(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= MIN_LONGITUDE &&
    value <= MAX_LONGITUDE
  );
}
