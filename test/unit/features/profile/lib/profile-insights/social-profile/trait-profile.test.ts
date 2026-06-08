import { describe, expect, it } from "vitest";

import { buildTraitProfile } from "@/features/profile/lib/profile-insights/social-profile/trait-profile";

describe("buildTraitProfile", () => {
  it("clamps out-of-range scores and neutralizes non-finite values", () => {
    const profile = buildTraitProfile({
      agreeableness: 101,
      conscientiousness: -4,
      extraversion: Number.NaN,
      neuroticism: 28,
      openness: 72,
    });

    expect(profile.scores).toEqual({
      agreeableness: 100,
      conscientiousness: 0,
      extraversion: 50,
      neuroticism: 28,
      openness: 72,
    });
    expect(profile.dominant).toEqual({
      key: "agreeableness",
      label: "warmth",
      value: 100,
    });
    expect([...profile.high]).toEqual(["agreeableness", "openness"]);
    expect([...profile.low]).toEqual(["conscientiousness", "neuroticism"]);
  });

  it("keeps deterministic dominant trait ordering for ties", () => {
    const profile = buildTraitProfile({
      agreeableness: 70,
      conscientiousness: 70,
      extraversion: 70,
      neuroticism: 70,
      openness: 70,
    });

    expect(profile.dominant.key).toBe("agreeableness");
  });
});
