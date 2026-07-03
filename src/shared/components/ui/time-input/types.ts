export type TimePeriod = "AM" | "PM";
export type TimeFormat = "12" | "24";

export interface TimeParts {
  hour: number;
  minute: number;
  period: TimePeriod;
}
