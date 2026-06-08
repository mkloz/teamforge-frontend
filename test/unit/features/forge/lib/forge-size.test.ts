import { describe, expect, it } from "vitest";

import {
  DEFAULT_GROUP_SIZE,
  getPreferredGroupSizeFromRange,
  normalizeFixedGroupSize,
  normalizeGroupSizeRange,
} from "@/features/forge/lib/forge-size";

describe("normalizeFixedGroupSize", () => {
  it("rounds finite values into the supported 2-8 range", () => {
    expect(normalizeFixedGroupSize(2.4)).toBe(2);
    expect(normalizeFixedGroupSize(2.5)).toBe(3);
    expect(normalizeFixedGroupSize(-20)).toBe(2);
    expect(normalizeFixedGroupSize(20)).toBe(8);
  });

  it("uses the default group size for non-finite values", () => {
    expect(normalizeFixedGroupSize(Number.NaN)).toBe(DEFAULT_GROUP_SIZE);
    expect(normalizeFixedGroupSize(Number.NEGATIVE_INFINITY)).toBe(
      DEFAULT_GROUP_SIZE,
    );
    expect(normalizeFixedGroupSize(Number.POSITIVE_INFINITY)).toBe(
      DEFAULT_GROUP_SIZE,
    );
  });

  it("normalizes range bounds into a stable ordered pair", () => {
    expect(normalizeGroupSizeRange(7, 4)).toEqual({ min: 4, max: 7 });
    expect(normalizeGroupSizeRange(-20, 20)).toEqual({ min: 2, max: 8 });
    expect(normalizeGroupSizeRange(Number.NaN, 5)).toEqual({ min: 5, max: 5 });
    expect(
      normalizeGroupSizeRange(Number.NaN, Number.POSITIVE_INFINITY),
    ).toEqual({
      min: DEFAULT_GROUP_SIZE,
      max: DEFAULT_GROUP_SIZE,
    });
  });

  it("derives the preferred backend group size from a normalized range", () => {
    expect(getPreferredGroupSizeFromRange(4, 7)).toBe(6);
    expect(getPreferredGroupSizeFromRange(7, 4)).toBe(6);
    expect(getPreferredGroupSizeFromRange(Number.NaN, 5)).toBe(5);
  });
});
