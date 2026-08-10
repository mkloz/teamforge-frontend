import {
  type CalendarDate,
  parseDate,
  parseTime,
  type Time,
} from "@internationalized/date";

const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const TIME_VALUE_PATTERN = /^\d{2}:\d{2}$/u;

export function parseCalendarDateValue(
  value: string | null | undefined,
): CalendarDate | null {
  if (!value || !DATE_VALUE_PATTERN.test(value)) {
    return null;
  }

  try {
    const parsed = parseDate(value);
    return parsed.toString() === value ? parsed : null;
  } catch {
    return null;
  }
}

export function serializeCalendarDateValue(value: CalendarDate | null) {
  return value?.toString() ?? "";
}

export function parseTimeValue(value: string | null | undefined): Time | null {
  if (!value || !TIME_VALUE_PATTERN.test(value)) {
    return null;
  }

  try {
    const parsed = parseTime(value);
    return parsed.toString().slice(0, 5) === value ? parsed : null;
  } catch {
    return null;
  }
}

export function serializeTimeValue(value: Time | null) {
  return value ? value.toString().slice(0, 5) : "";
}
