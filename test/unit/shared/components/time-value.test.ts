import { Time } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { serializeTimeValue } from "@/shared/components/ui/date-time-picker/value-adapters";
import {
  getInitialTimeDraft,
  getTimeAdjustmentMessage,
  normalizeTimeInterval,
  resolveTimeCommitValue,
  snapTimeValue,
} from "@/shared/components/ui/time-input/time-value";

describe("time input value policy", () => {
  it.each([
    ["09:37", 5, "09:35"],
    ["09:58", 5, "10:00"],
    ["09:35", 10, "09:40"],
    ["23:58", 5, "23:55"],
    ["23:59", 5, "23:55"],
  ])("snaps %s on a %i-minute same-day grid to %s", (value, step, expected) => {
    const [hour, minute] = value.split(":").map(Number);
    expect(
      serializeTimeValue(snapTimeValue(new Time(hour, minute), step)),
    ).toBe(expected);
  });

  it("normalizes invalid and non-divisor intervals to five minutes", () => {
    expect(normalizeTimeInterval(0)).toBe(5);
    expect(normalizeTimeInterval(7)).toBe(5);
    expect(normalizeTimeInterval(2.5)).toBe(5);
    expect(normalizeTimeInterval(Number.NaN)).toBe(5);
    expect(normalizeTimeInterval(15)).toBe(15);
  });

  it("uses the nearest current local step only for a blank overlay", () => {
    const draft = getInitialTimeDraft(null, 5, new Date(2026, 7, 11, 9, 58));
    expect(serializeTimeValue(draft)).toBe("10:00");

    const committed = new Time(9, 37);
    expect(getInitialTimeDraft(committed, 5)).toBe(committed);
  });

  it("describes an adjustment before it is committed", () => {
    expect(getTimeAdjustmentMessage(new Time(9, 37), 5)).toBe(
      "Will save as 09:35 to match 5-minute intervals.",
    );
    expect(getTimeAdjustmentMessage(new Time(9, 35), 5)).toBe("");
  });

  it("resolves commits on the interval grid within off-grid bounds", () => {
    expect(
      serializeTimeValue(
        resolveTimeCommitValue(new Time(9, 37), 5, new Time(9, 37), null),
      ),
    ).toBe("09:40");
    expect(
      serializeTimeValue(
        resolveTimeCommitValue(new Time(9, 3), 5, null, new Time(9, 3)),
      ),
    ).toBe("09:00");
  });

  it("rejects a range containing no interval point", () => {
    const minValue = new Time(9, 1);
    const maxValue = new Time(9, 3);
    expect(
      resolveTimeCommitValue(new Time(9, 2), 5, minValue, maxValue),
    ).toBeNull();
    expect(
      getTimeAdjustmentMessage(new Time(9, 2), 5, minValue, maxValue),
    ).toBe("No 5-minute interval is available within this time range.");
  });

  it("clamps a blank overlay draft to the nearest valid range step", () => {
    expect(
      serializeTimeValue(
        getInitialTimeDraft(
          null,
          5,
          new Date(2026, 7, 11, 21, 37),
          new Time(9, 0),
          new Time(17, 0),
        ),
      ),
    ).toBe("17:00");
    expect(
      serializeTimeValue(
        getInitialTimeDraft(
          null,
          5,
          new Date(2026, 7, 11, 5, 12),
          new Time(9, 0),
          new Time(17, 0),
        ),
      ),
    ).toBe("09:00");
  });
});
