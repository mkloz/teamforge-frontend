import { describe, expect, it } from "vitest";

import {
  joinLocalDateTimeValue,
  parseCalendarDateValue,
  parseTimeValue,
  serializeCalendarDateValue,
  serializeTimeValue,
  splitLocalDateTimeValue,
} from "@/shared/components/ui/date-time-picker/value-adapters";

describe("date and time value adapters", () => {
  it.each([
    "UTC",
    "Europe/London",
    "America/New_York",
    "Asia/Kolkata",
  ])("keeps local date strings stable without timezone conversion (%s)", () => {
    const leapDay = parseCalendarDateValue("2028-02-29");
    expect(serializeCalendarDateValue(leapDay)).toBe("2028-02-29");
    expect(parseCalendarDateValue("2027-02-29")).toBeNull();
    expect(parseCalendarDateValue("2028-2-9")).toBeNull();
    expect(parseCalendarDateValue("")).toBeNull();
  });

  it("round trips strict minute values and rejects invalid or partial input", () => {
    expect(serializeTimeValue(parseTimeValue("00:00"))).toBe("00:00");
    expect(serializeTimeValue(parseTimeValue("23:59"))).toBe("23:59");
    expect(parseTimeValue("24:00")).toBeNull();
    expect(parseTimeValue("9:30")).toBeNull();
    expect(parseTimeValue("09:30:00")).toBeNull();
  });

  it("preserves the local datetime string contract and its noon default", () => {
    expect(splitLocalDateTimeValue("2028-02-29T09:35:45")).toEqual({
      date: "2028-02-29",
      time: "09:35",
    });
    expect(splitLocalDateTimeValue("not-a-datetime")).toEqual({
      date: "",
      time: "",
    });
    expect(joinLocalDateTimeValue("2028-02-29", "09:35")).toBe(
      "2028-02-29T09:35",
    );
    expect(joinLocalDateTimeValue("2028-02-29", "")).toBe("2028-02-29T12:00");
    expect(joinLocalDateTimeValue("", "09:35")).toBe("");
    expect(joinLocalDateTimeValue("2027-02-29", "09:35")).toBe("");
    expect(joinLocalDateTimeValue("2028-02-29", "24:00")).toBe("");
  });
});
