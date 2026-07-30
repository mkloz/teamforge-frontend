import { z } from "zod";

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const DateOfBirthValidator = z
  .string()
  .trim()
  .min(1, "Enter your date of birth.")
  .refine(
    (value) => value.length === 0 || isValidPastDateOnly(value),
    "Enter a valid date of birth.",
  );

export function getTodayDateOnly(today = new Date()) {
  return [
    String(today.getUTCFullYear()).padStart(4, "0"),
    String(today.getUTCMonth() + 1).padStart(2, "0"),
    String(today.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function getAgeFromDateOfBirth(
  value: string,
  today = new Date(),
): number | null {
  if (!isValidPastDateOnly(value, getTodayDateOnly(today))) {
    return null;
  }

  const parts = DATE_ONLY_PATTERN.exec(value);

  if (!parts) return null;

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  let age = today.getUTCFullYear() - year;
  const birthdayHasPassed =
    today.getUTCMonth() + 1 > month ||
    (today.getUTCMonth() + 1 === month && today.getUTCDate() >= day);

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
}

function isValidPastDateOnly(value: string, today = getTodayDateOnly()) {
  const parts = DATE_ONLY_PATTERN.exec(value);

  if (!parts) {
    return false;
  }

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  const date = new Date(0);

  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    value <= today
  );
}
