import { describe, expect, it } from "vitest";

import {
  getUserOceanScores,
  normalizePercentScore,
  normalizeTrustScore,
} from "@/shared/lib/user-psychometrics";
import { createUser } from "../../factories/user";

describe("normalizePercentScore", () => {
  it("normalizes explicit percent and fraction scales", () => {
    expect(normalizePercentScore(0.82, { inputScale: "fraction" })).toBe(82);
    expect(normalizePercentScore(0.82, { inputScale: "percent" })).toBe(0.82);
    expect(normalizePercentScore(82, { inputScale: "percent" })).toBe(82);
  });

  it("supports legacy auto scale only when a caller explicitly requests it", () => {
    expect(normalizePercentScore(0.82, { inputScale: "auto" })).toBe(82);
    expect(normalizePercentScore(1, { inputScale: "auto" })).toBe(100);
    expect(normalizePercentScore(1, { inputScale: "percent" })).toBe(1);
  });

  it("rounds, clamps, and rejects invalid percentage values predictably", () => {
    expect(normalizePercentScore(72.6, { round: true })).toBe(73);
    expect(normalizePercentScore(-10)).toBe(0);
    expect(normalizePercentScore(130)).toBe(100);
    expect(normalizePercentScore(Number.NaN)).toBeNull();
    expect(normalizePercentScore(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("normalizeTrustScore", () => {
  it("keeps legacy auto normalization for fractional backend scores", () => {
    expect(normalizeTrustScore(0.82)).toBe(82);
    expect(normalizeTrustScore(1)).toBe(100);
  });

  it("allows callers to disambiguate exact percentage trust scores", () => {
    expect(normalizeTrustScore(1, { inputScale: "percent" })).toBe(1);
    expect(normalizeTrustScore(0.82, { inputScale: "fraction" })).toBe(82);
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
  it("returns normalized percent OCEAN scores when every trait is present", () => {
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

  it("treats OCEAN scores as percentages by default to avoid auto-scale ambiguity", () => {
    expect(
      getUserOceanScores(
        createUser({
          oceanO: 0.8,
          oceanC: 0.68,
          oceanE: 0.44,
          oceanA: 0.72,
          oceanN: 0.31,
        }),
      ),
    ).toEqual({
      openness: 0.8,
      conscientiousness: 0.68,
      extraversion: 0.44,
      agreeableness: 0.72,
      neuroticism: 0.31,
    });
  });

  it("normalizes fractional OCEAN scores only when the caller opts in", () => {
    expect(
      getUserOceanScores(
        createUser({
          oceanO: 0.8,
          oceanC: 0.68,
          oceanE: 0.44,
          oceanA: 0.72,
          oceanN: 0.31,
        }),
        { inputScale: "fraction" },
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
