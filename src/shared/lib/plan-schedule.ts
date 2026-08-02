const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)$/u;

export interface CanonicalPlanScheduleInput {
  dateTime: string;
  durationMinutes: number;
  localStartDate: string;
  localStartTime: string;
  scheduleFold: number;
  timeZoneId: string;
}

export function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function isValidTimeZone(timeZoneId: string) {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: timeZoneId }).format();
    return true;
  } catch {
    return false;
  }
}

export function getSupportedTimeZones() {
  return typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [getBrowserTimeZone(), "UTC"];
}

export function resolveLocalPlanScheduleCandidates(
  localDateTime: string,
  timeZoneId: string,
) {
  const match = LOCAL_DATE_TIME_PATTERN.exec(localDateTime);
  if (!match || !isValidTimeZone(timeZoneId)) {
    return [];
  }

  const [, localDate, localHour, localMinute] = match;
  const [year, month, day] = localDate.split("-").map(Number);
  const guess = Date.UTC(
    year,
    month - 1,
    day,
    Number(localHour),
    Number(localMinute),
  );
  const expected = `${localDate} ${localHour}:${localMinute}`;
  const formatter = getScheduleFormatter(timeZoneId);
  const offsets = new Set<number>();

  for (const sampleHours of [-36, -12, 0, 12, 36]) {
    const sample = new Date(guess + sampleHours * 3_600_000);
    offsets.add(getRenderedOffsetMinutes(formatter, sample));
  }

  return [...offsets]
    .map((offset) => new Date(guess - offset * 60_000))
    .filter((candidate) => renderLocalMinute(formatter, candidate) === expected)
    .sort((left, right) => left.getTime() - right.getTime())
    .filter(
      (candidate, index, candidates) =>
        index === 0 || candidate.getTime() !== candidates[index - 1]?.getTime(),
    );
}

export function buildCanonicalPlanScheduleInput(input: {
  durationMinutes: string;
  localDateTime: string;
  scheduleFold: number;
  timeZoneId: string;
}): CanonicalPlanScheduleInput | null {
  const match = LOCAL_DATE_TIME_PATTERN.exec(input.localDateTime);
  const durationMinutes = Number(input.durationMinutes);
  if (
    !match ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 1440
  ) {
    return null;
  }

  const candidates = resolveLocalPlanScheduleCandidates(
    input.localDateTime,
    input.timeZoneId,
  );
  const selected = candidates[input.scheduleFold];
  if (!selected) {
    return null;
  }

  return {
    dateTime: selected.toISOString(),
    durationMinutes,
    localStartDate: match[1],
    localStartTime: `${match[2]}:${match[3]}`,
    scheduleFold: input.scheduleFold,
    timeZoneId: input.timeZoneId,
  };
}

export function toPlanLocalDateTimeValue(
  value: string | null | undefined,
  timeZoneId: string | null | undefined,
) {
  if (!value || !timeZoneId || !isValidTimeZone(timeZoneId)) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return renderLocalMinute(getScheduleFormatter(timeZoneId), date).replace(
    " ",
    "T",
  );
}

function getScheduleFormatter(timeZoneId: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: timeZoneId,
    year: "numeric",
  });
}

function renderLocalMinute(formatter: Intl.DateTimeFormat, date: Date) {
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

function getRenderedOffsetMinutes(
  formatter: Intl.DateTimeFormat,
  instant: Date,
) {
  const rendered = renderLocalMinute(formatter, instant);
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/u.exec(rendered);
  if (!match) {
    return 0;
  }
  const renderedAsUtc = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );
  return Math.round((renderedAsUtc - instant.getTime()) / 60_000);
}
