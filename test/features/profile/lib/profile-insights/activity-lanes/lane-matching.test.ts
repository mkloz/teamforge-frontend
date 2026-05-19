import { describe, expect, it } from "vitest";

import { getLaneMatches } from "@/features/profile/lib/profile-insights/activity-lanes/lane-matching";
import { createProfileInterest } from "../../../../../factories/profile-insights";

describe("getLaneMatches", () => {
  it("matches direct interest text after normalizing diacritics", () => {
    expect(
      getLaneMatches(
        createProfileInterest("cafe_meetups", "Café meetups", {
          aliases: ["espresso crawl"],
          slug: "café-meetups",
        }),
      )[0],
    ).toMatchObject({
      key: "food",
      reason: "direct",
      role: "primary",
    });
  });

  it("matches taxonomy ids across common separator variants", () => {
    expect(
      getLaneMatches(
        createProfileInterest("regional_pours", "Regional pours", {
          parentId: "Food & Drink",
        }),
      )[0],
    ).toMatchObject({
      key: "food",
      reason: "mixed",
      role: "primary",
    });
  });

  it("falls back to the general lane when no lane rule matches", () => {
    expect(
      getLaneMatches(createProfileInterest("rare_collectible", "Rare thing")),
    ).toEqual([
      {
        key: "general",
        rawScore: 1,
        reason: "fallback",
        role: "primary",
        score: 1,
      },
    ]);
  });
});
