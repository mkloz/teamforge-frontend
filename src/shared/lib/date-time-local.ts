function padDateTimePart(part: number) {
  return String(part).padStart(2, "0");
}

export function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${padDateTimePart(
    date.getMonth() + 1,
  )}-${padDateTimePart(date.getDate())}T${padDateTimePart(
    date.getHours(),
  )}:${padDateTimePart(date.getMinutes())}`;
}

export function dateTimeLocalToIsoString(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}
