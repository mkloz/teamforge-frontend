import { describe, expect, it } from "vitest";

import {
  buildPersonalityTensions,
  parsePersonalityType,
} from "@/features/profile/lib/profile-insights/social-profile/personality-profile";
import { createTraitProfile } from "../../../../../factories/profile-insights";

describe("personality profile parsing", () => {
  it("normalizes valid MBTI types into social dimensions", () => {
    expect(parsePersonalityType(" enfp ")).toEqual({
      attention: "possibility",
      decision: "people",
      energy: "outward",
      structure: "open",
      type: "ENFP",
    });
  });

  it("returns an unknown profile for missing or invalid runtime values", () => {
    expect(parsePersonalityType(null)).toMatchObject({
      attention: "unknown",
      decision: "unknown",
      energy: "unknown",
      structure: "unknown",
      type: null,
    });
    expect(parsePersonalityType("NOPE")).toMatchObject({ type: null });
  });
});

describe("buildPersonalityTensions", () => {
  it("captures mixed MBTI and OCEAN cues but caps the list to two", () => {
    const tensions = buildPersonalityTensions(
      parsePersonalityType("ENTJ"),
      createTraitProfile({
        agreeableness: 80,
        conscientiousness: 30,
        extraversion: 30,
        neuroticism: 50,
        openness: 50,
      }),
    );

    expect(tensions).toHaveLength(2);
    expect(tensions.map((tension) => tension.label)).toEqual([
      "Mixed social cue",
      "Mixed planning cue",
    ]);
  });

  it("does not invent tensions without both personality and trait data", () => {
    expect(
      buildPersonalityTensions(parsePersonalityType("INTJ"), null),
    ).toEqual([]);
    expect(
      buildPersonalityTensions(
        parsePersonalityType(null),
        createTraitProfile(),
      ),
    ).toEqual([]);
  });
});
