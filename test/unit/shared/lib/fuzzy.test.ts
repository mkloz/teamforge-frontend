import { describe, expect, it } from "vitest";

import {
  fuzzyMatch,
  getFuzzyMatch,
  getFuzzyMatchScore,
  levenshtein,
  normalizeSearchText,
} from "@/shared/lib/fuzzy";

describe("levenshtein", () => {
  it("calculates common edit distances", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("planCreation", "planCreation")).toBe(0);
    expect(levenshtein("", "team")).toBe(4);
    expect(levenshtein("group", "")).toBe(5);
  });

  it("is symmetrical for insertions, deletions, and substitutions", () => {
    const pairs: Array<[string, string]> = [
      ["coffee", "cofee"],
      ["running", "runing"],
      ["board", "bored"],
      ["workshop", "workshp"],
    ];

    for (const [a, b] of pairs) {
      expect(levenshtein(a, b)).toBe(levenshtein(b, a));
    }
  });
});

describe("fuzzyMatch", () => {
  it("matches exact substrings case-insensitively", () => {
    expect(fuzzyMatch("Board Games", "board")).toBe(true);
    expect(fuzzyMatch("Board Games", "GAMES")).toBe(true);
  });

  it("normalizes harmless whitespace and diacritics", () => {
    expect(fuzzyMatch("Cafe hopping", " cafe ")).toBe(true);
    expect(fuzzyMatch("Café hopping", "cafe")).toBe(true);
  });

  it("allows one-character typos for single-word queries of at least four characters", () => {
    expect(fuzzyMatch("running club", "runing")).toBe(true);
    expect(fuzzyMatch("photography walk", "photograpy")).toBe(true);
  });

  it("does not use fuzzy matching for short or multi-word queries", () => {
    expect(fuzzyMatch("run club", "rn")).toBe(false);
    expect(fuzzyMatch("board games", "bord game")).toBe(false);
  });

  it("does not match empty queries or unrelated words", () => {
    expect(fuzzyMatch("Tech & Build", "")).toBe(false);
    expect(fuzzyMatch("Tech & Build", "ceramics")).toBe(false);
  });
});

describe("getFuzzyMatch", () => {
  it("normalizes diacritics, punctuation, and repeated whitespace before scoring", () => {
    expect(normalizeSearchText("  Café  &   Board-Games ")).toBe(
      "cafe board games",
    );
    expect(
      getFuzzyMatch("Café & Board-Games", "cafe board games"),
    ).toMatchObject({
      kind: "exact",
      score: 100,
    });
  });

  it("scores stronger matches above weaker matches", () => {
    expect(getFuzzyMatchScore("coding", "coding")).toBeGreaterThan(
      getFuzzyMatchScore("coding workshop", "coding"),
    );
    expect(getFuzzyMatchScore("coding workshop", "coding")).toBeGreaterThan(
      getFuzzyMatchScore("software coding", "coding"),
    );
    expect(getFuzzyMatchScore("software coding", "coding")).toBeGreaterThan(
      getFuzzyMatchScore("recoding", "coding"),
    );
    expect(getFuzzyMatchScore("recoding", "coding")).toBeGreaterThan(
      getFuzzyMatchScore("running club", "runing"),
    );
    expect(getFuzzyMatchScore("running club", "runing")).toBeGreaterThan(
      getFuzzyMatchScore("ceramics", "coding"),
    );
  });

  it("returns structured match kinds for ranking consumers", () => {
    expect(getFuzzyMatch("coding", "coding")).toMatchObject({
      kind: "exact",
      score: 100,
    });
    expect(getFuzzyMatch("coding workshop", "coding")).toMatchObject({
      kind: "prefix",
      score: 90,
    });
    expect(getFuzzyMatch("software coding", "coding")).toMatchObject({
      kind: "word-prefix",
      score: 82,
    });
    expect(getFuzzyMatch("recoding", "coding")).toMatchObject({
      kind: "substring",
      score: 72,
    });
    expect(getFuzzyMatch("running club", "runing")).toMatchObject({
      kind: "typo",
      score: 56,
    });
    expect(getFuzzyMatch("ceramics", "coding")).toMatchObject({
      kind: "none",
      score: 0,
    });
  });
});
