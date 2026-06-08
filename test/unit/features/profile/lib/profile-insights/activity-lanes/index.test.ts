import { createProfileInterest } from "@test/support/factories/profile-insights";
import { describe, expect, it } from "vitest";
import { buildActivityLanes } from "@/features/profile/lib/profile-insights/activity-lanes";

describe("buildActivityLanes", () => {
  it("ranks strong lanes by score and keeps evidence deduplicated", () => {
    const duplicateCoding = createProfileInterest("coding", "Coding", {
      aliases: ["software"],
    });
    const lanes = buildActivityLanes([
      duplicateCoding,
      duplicateCoding,
      createProfileInterest("ai_tools", "AI tools"),
      createProfileInterest("startups", "Startups"),
      createProfileInterest("coffee", "Coffee"),
    ]);

    expect(lanes[0]).toMatchObject({
      confidence: "strong",
      key: "builder",
      primaryEvidenceCount: 3,
    });
    expect(lanes[0]?.interests.map((interest) => interest.id)).toEqual([
      "ai_tools",
      "coding",
      "startups",
    ]);
    expect(lanes[1]?.key).toBe("food");
  });

  it("creates a general soft lane for unclassified interests", () => {
    expect(
      buildActivityLanes([createProfileInterest("oddity", "Oddity")])[0],
    ).toMatchObject({
      confidence: "soft",
      key: "general",
      score: 1,
    });
  });
});
