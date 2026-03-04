/**
 * Time constants and utilities.
 * Exported as standalone constants/functions instead of a static-only class.
 */

export const DayTime = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  NIGHT: "Night",
} as const;

export type DayTime = (typeof DayTime)[keyof typeof DayTime];

/** Duration constants in milliseconds. */
export const ONE_MILLISECOND = 1;
export const ONE_SECOND = ONE_MILLISECOND * 1000;
export const ONE_MINUTE = ONE_SECOND * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;
export const ONE_MONTH = ONE_DAY * 30;
export const ONE_YEAR = ONE_DAY * 365;

export function getDayTime(): DayTime {
  const hours = new Date().getHours();

  if (hours > 22 || hours < 5) return DayTime.NIGHT;
  if (hours >= 5 && hours < 12) return DayTime.MORNING;
  if (hours >= 12 && hours < 17) return DayTime.AFTERNOON;
  return DayTime.EVENING;
}

export function timeout(ms: number, callback?: () => void): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      callback?.();
      resolve();
    }, ms);
  });
}
