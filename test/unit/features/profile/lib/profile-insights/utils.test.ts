import { describe, expect, it } from "vitest";

import {
  capitalize,
  clamp,
  getFirstName,
  normalizeTaxonomyId,
  normalizeText,
  roundScore,
  scoreBool,
} from "@/features/profile/lib/profile-insights/utils";

describe("profile insight utils", () => {
  it("extracts display first names with a safe fallback", () => {
    expect(getFirstName(" Ada Lovelace ")).toBe("Ada");
    expect(getFirstName("   ")).toBe("This profile");
  });

  it("scores boolean cues and normalizes finite numeric scores", () => {
    expect(scoreBool(true, 3.5)).toBe(3.5);
    expect(scoreBool(false, 3.5)).toBe(0);
    expect(clamp(12, 0, 10)).toBe(10);
    expect(clamp(Number.NaN, 0, 10)).toBe(0);
    expect(roundScore(3.456)).toBe(3.46);
  });

  it("normalizes text for regex matching across casing, whitespace, and diacritics", () => {
    expect(normalizeText(["  Café ", null, "RUNNING"])).toBe("cafe running");
  });

  it("normalizes taxonomy ids while keeping useful original and slug variants", () => {
    expect(normalizeTaxonomyId(" Food & Drink ")).toEqual([
      "food & drink",
      "food_drink",
    ]);
    expect(normalizeTaxonomyId("visual-arts")).toEqual([
      "visual-arts",
      "visual_arts",
    ]);
    expect(normalizeTaxonomyId("   ")).toEqual([]);
  });

  it("capitalizes only the first character", () => {
    expect(capitalize("builder")).toBe("Builder");
    expect(capitalize("")).toBe("");
  });
});
