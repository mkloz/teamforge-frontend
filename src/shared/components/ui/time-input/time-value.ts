import { Time } from "@internationalized/date";

import { serializeTimeValue } from "@/shared/components/ui/date-time-picker/value-adapters";

export const DEFAULT_TIME_INTERVAL_MINUTES = 5;

export function normalizeTimeInterval(intervalMinutes: number | undefined) {
  if (
    !Number.isFinite(intervalMinutes) ||
    !Number.isInteger(intervalMinutes) ||
    !intervalMinutes ||
    intervalMinutes < 1 ||
    60 % intervalMinutes !== 0
  ) {
    return DEFAULT_TIME_INTERVAL_MINUTES;
  }

  return intervalMinutes;
}

export function snapTimeValue(
  value: Time | null,
  intervalMinutes: number | undefined,
) {
  return resolveTimeCommitValue(value, intervalMinutes);
}

export function getCurrentLocalTimeValue(now = new Date()) {
  return new Time(now.getHours(), now.getMinutes());
}

export function getInitialTimeDraft(
  committedValue: Time | null,
  intervalMinutes: number | undefined,
  now = new Date(),
  minValue: Time | null = null,
  maxValue: Time | null = null,
) {
  return (
    committedValue ??
    resolveTimeCommitValue(
      getCurrentLocalTimeValue(now),
      intervalMinutes,
      minValue,
      maxValue,
    )
  );
}

export function isTimeWithinRange(
  value: Time,
  minValue: Time | null,
  maxValue: Time | null,
) {
  return (
    (!minValue || value.compare(minValue) >= 0) &&
    (!maxValue || value.compare(maxValue) <= 0)
  );
}

export function resolveTimeCommitValue(
  value: Time | null,
  intervalMinutes: number | undefined,
  minValue: Time | null = null,
  maxValue: Time | null = null,
) {
  if (!value) {
    return null;
  }

  const { firstGridIndex, interval, lastGridIndex } = getTimeCommitGrid(
    intervalMinutes,
    minValue,
    maxValue,
  );

  if (firstGridIndex > lastGridIndex) {
    return null;
  }

  const minuteOfDay = value.hour * 60 + value.minute;
  const nearestGridIndex = Math.floor((minuteOfDay + interval / 2) / interval);
  const resolvedGridIndex = Math.min(
    lastGridIndex,
    Math.max(firstGridIndex, nearestGridIndex),
  );
  const resolvedMinute = resolvedGridIndex * interval;

  return new Time(Math.floor(resolvedMinute / 60), resolvedMinute % 60);
}

export function getTimeAdjustmentMessage(
  draftValue: Time | null,
  intervalMinutes: number | undefined,
  minValue: Time | null = null,
  maxValue: Time | null = null,
) {
  if (!draftValue) {
    const { firstGridIndex, interval, lastGridIndex } = getTimeCommitGrid(
      intervalMinutes,
      minValue,
      maxValue,
    );
    return firstGridIndex > lastGridIndex
      ? `No ${interval}-minute interval is available within this time range.`
      : "";
  }

  const snappedValue = resolveTimeCommitValue(
    draftValue,
    intervalMinutes,
    minValue,
    maxValue,
  );
  if (!snappedValue) {
    return `No ${normalizeTimeInterval(intervalMinutes)}-minute interval is available within this time range.`;
  }
  const draft = serializeTimeValue(draftValue);
  const snapped = serializeTimeValue(snappedValue);

  return draft === snapped
    ? ""
    : `Will save as ${snapped} to match ${normalizeTimeInterval(intervalMinutes)}-minute intervals.`;
}

function getTimeCommitGrid(
  intervalMinutes: number | undefined,
  minValue: Time | null,
  maxValue: Time | null,
) {
  const interval = normalizeTimeInterval(intervalMinutes);
  const minMinute = minValue ? minValue.hour * 60 + minValue.minute : 0;
  const maxMinute = maxValue
    ? maxValue.hour * 60 + maxValue.minute
    : 24 * 60 - 1;

  return {
    firstGridIndex: Math.ceil(minMinute / interval),
    interval,
    lastGridIndex: Math.floor(maxMinute / interval),
  };
}
