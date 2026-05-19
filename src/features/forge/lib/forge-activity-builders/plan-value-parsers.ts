import type { AutoForgeExecutionInput } from "@/features/forge/lib/forge-execution-schema";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;
const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

export function buildDateTime(planDate: string, planTime: string) {
  const dateParts = parseDateParts(planDate);
  const timeParts = parseTimeParts(planTime);
  const timestamp = new Date(`${planDate}T${planTime}`);

  if (
    !dateParts ||
    !timeParts ||
    Number.isNaN(timestamp.getTime()) ||
    timestamp.getFullYear() !== dateParts.year ||
    timestamp.getMonth() !== dateParts.month - 1 ||
    timestamp.getDate() !== dateParts.day ||
    timestamp.getHours() !== timeParts.hours ||
    timestamp.getMinutes() !== timeParts.minutes
  ) {
    throw new Error("Invalid forge plan date-time");
  }

  return timestamp.toISOString();
}

export function getCoordinatePair(
  lat: number | null | undefined,
  lng: number | null | undefined,
) {
  return isValidLatitude(lat) && isValidLongitude(lng) ? { lat, lng } : null;
}

export function parseCostAmount(input: AutoForgeExecutionInput) {
  if (input.planCost !== "PAID") {
    return null;
  }

  const amount = Number(input.planCostAmount);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
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
