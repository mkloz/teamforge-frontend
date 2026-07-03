const LOCAL_DATE_VALUE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface LocalDateValue {
  day: number;
  month: number;
  year: number;
}

export function parseLocalDateValue(
  value: string | null | undefined,
): LocalDateValue | null {
  const match = value?.match(LOCAL_DATE_VALUE_PATTERN);

  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return { day, month, year };
}

export function isValidLocalDateValue(value: string | null | undefined) {
  return parseLocalDateValue(value) !== null;
}
