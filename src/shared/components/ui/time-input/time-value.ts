import type { TimeParts, TimePeriod } from "./types";

const TIME_12_HOUR_DISPLAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
});
const TIME_24_HOUR_DISPLAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
});
const LOCAL_TIME_FORMAT_OPTIONS = new Intl.DateTimeFormat().resolvedOptions();
const LOCAL_NUMERIC_HOUR_FORMAT_OPTIONS = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
}).resolvedOptions();

export function formatTimeDisplay(
  value: string | null | undefined,
  useMeridiem: boolean,
) {
  if (!value) {
    return "";
  }

  const timeMinutes = parseTimeMinutes(value);

  if (timeMinutes == null) {
    return value;
  }

  const date = new Date();
  date.setHours(Math.floor(timeMinutes / 60), timeMinutes % 60, 0, 0);

  return getTimeDisplayFormatter(useMeridiem).format(date);
}

function getTimeDisplayFormatter(useMeridiem: boolean) {
  return useMeridiem
    ? TIME_12_HOUR_DISPLAY_FORMATTER
    : TIME_24_HOUR_DISPLAY_FORMATTER;
}

function parseTimeMinutes(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timeParts = readTimeMinuteParts(value);

  if (!areValidTimeMinuteParts(timeParts)) {
    return null;
  }

  return getTotalTimeMinutes(timeParts);
}

function readTimeMinuteParts(value: string) {
  const [hourValue, minuteValue] = value.split(":").map(Number);

  return { hourValue, minuteValue };
}

function areValidTimeMinuteParts({
  hourValue,
  minuteValue,
}: ReturnType<typeof readTimeMinuteParts>) {
  return isValidTimeHour(hourValue) && isValidTimeMinute(minuteValue);
}

function isValidTimeHour(hour: number) {
  return Number.isFinite(hour) && hour >= 0 && hour <= 23;
}

function isValidTimeMinute(minute: number) {
  return Number.isFinite(minute) && minute >= 0 && minute <= 59;
}

function getTotalTimeMinutes({
  hourValue,
  minuteValue,
}: ReturnType<typeof readTimeMinuteParts>) {
  return hourValue * 60 + minuteValue;
}

export function buildMinuteOptions(intervalMinutes: number) {
  const safeInterval = getSafeInterval(intervalMinutes);
  const optionCount = Math.ceil(60 / safeInterval);

  return Array.from({ length: optionCount }, (_, index) => {
    return Math.min(index * safeInterval, 59);
  });
}

function getSafeInterval(intervalMinutes: number) {
  return Math.max(5, Math.min(60, intervalMinutes));
}

export function buildHourOptions(useMeridiem: boolean) {
  return Array.from({ length: useMeridiem ? 12 : 24 }, (_, index) =>
    useMeridiem ? index + 1 : index,
  );
}

export function getTimeParts(
  value: string | null | undefined,
  intervalMinutes: number,
  useMeridiem: boolean,
): TimeParts {
  const fallbackValue = getCurrentTimeValue(intervalMinutes);
  const minutes =
    parseTimeMinutes(value) ?? parseTimeMinutes(fallbackValue) ?? 0;
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period: TimePeriod = hour24 >= 12 ? "PM" : "AM";

  return {
    hour: useMeridiem ? hour24 % 12 || 12 : hour24,
    minute,
    period,
  };
}

function getCurrentTimeValue(intervalMinutes: number) {
  const safeInterval = getSafeInterval(intervalMinutes);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const roundedMinutes =
    Math.round(currentMinutes / safeInterval) * safeInterval;
  const boundedMinutes = Math.min(23 * 60 + 59, roundedMinutes);

  return formatTimeValue(Math.floor(boundedMinutes / 60), boundedMinutes % 60);
}

function formatTimeValue(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function getCommittedTimeValue({
  parts,
  selectedParts,
  useMeridiem,
}: {
  parts: Partial<TimeParts>;
  selectedParts: TimeParts;
  useMeridiem: boolean;
}) {
  const hour = parts.hour ?? selectedParts.hour;
  const minute = parts.minute ?? selectedParts.minute;
  const period = parts.period ?? selectedParts.period;

  return formatTimeValue(toHour24(hour, period, useMeridiem), minute);
}

function toHour24(hour: number, period: TimePeriod, useMeridiem: boolean) {
  if (!useMeridiem) {
    return hour;
  }

  return (hour % 12) + (period === "PM" ? 12 : 0);
}

export function getNearestTimeOption(options: number[], value: number) {
  return options.reduce((nearest, option) =>
    Math.abs(option - value) < Math.abs(nearest - value) ? option : nearest,
  );
}

export function shouldUseMeridiemTime() {
  const timeZone = LOCAL_TIME_FORMAT_OPTIONS.timeZone;

  if (timeZone === "Europe/London" || timeZone === "Europe/Belfast") {
    return true;
  }

  return LOCAL_NUMERIC_HOUR_FORMAT_OPTIONS.hour12 === true;
}
