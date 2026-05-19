import { describe, expect, it } from "vitest";

import {
  getUserOceanScores,
  normalizeTrustScore,
} from "@/shared/lib/user-psychometrics";
import { createUser } from "../../factories/user";

describe("normalizeTrustScore", () => {
  it("normalizes fractional backend scores to percentages", () => {
    expect(normalizeTrustScore(0.82)).toBe(82);
    expect(normalizeTrustScore(1)).toBe(100);
  });

  it("keeps percentage scores and rounds them to whole display values", () => {
    expect(normalizeTrustScore(72)).toBe(72);
    expect(normalizeTrustScore(72.6)).toBe(73);
  });

  it("clamps out-of-range and non-finite values", () => {
    expect(normalizeTrustScore(-10)).toBe(0);
    expect(normalizeTrustScore(130)).toBe(100);
    expect(normalizeTrustScore(Number.NaN)).toBe(0);
    expect(normalizeTrustScore(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("getUserOceanScores", () => {
  it("returns normalized OCEAN scores when every trait is present", () => {
    expect(
      getUserOceanScores(
        createUser({
          oceanO: 80,
          oceanC: 68,
          oceanE: 44,
          oceanA: 72,
          oceanN: 31,
        }),
      ),
    ).toEqual({
      openness: 80,
      conscientiousness: 68,
      extraversion: 44,
      agreeableness: 72,
      neuroticism: 31,
    });
  });

  it("clamps trait scores without discarding a complete profile", () => {
    expect(
      getUserOceanScores(
        createUser({
          oceanO: 110,
          oceanC: -4,
          oceanE: 44.5,
          oceanA: 72,
          oceanN: 31,
        }),
      ),
    ).toEqual({
      openness: 100,
      conscientiousness: 0,
      extraversion: 44.5,
      agreeableness: 72,
      neuroticism: 31,
    });
  });

  it("returns null when any trait is missing or non-finite", () => {
    expect(
      getUserOceanScores(
        createUser({
          oceanO: 80,
          oceanC: 68,
          oceanE: null,
          oceanA: 72,
          oceanN: 31,
        }),
      ),
    ).toBeNull();

    expect(
      getUserOceanScores(
        createUser({
          oceanO: 80,
          oceanC: Number.NaN,
          oceanE: 44,
          oceanA: 72,
          oceanN: 31,
        }),
      ),
    ).toBeNull();
  });
});
