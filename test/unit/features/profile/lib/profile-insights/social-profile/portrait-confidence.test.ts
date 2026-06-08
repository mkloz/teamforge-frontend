import {
  createActivityLane,
  createProfileInterest,
} from "@test/support/factories/profile-insights";
import { createUser } from "@test/support/factories/user";
import { describe, expect, it } from "vitest";
import {
  getCloseSecondCandidate,
  getPortraitConfidence,
} from "@/features/profile/lib/profile-insights/social-profile/portrait-confidence";

describe("portrait confidence", () => {
  const candidates = [
    {
      key: "focusedBuilder" as const,
      score: 10,
      share: 0.5,
      title: "Focused Builder",
    },
    {
      key: "curiousSpecialist" as const,
      score: 9.2,
      share: 0.46,
      title: "Curious Specialist",
    },
    {
      key: "flexibleParticipant" as const,
      score: 1,
      share: 0.04,
      title: "Flexible Participant",
    },
  ];

  it("returns a close second only when the leader margin is hybrid-close", () => {
    expect(getCloseSecondCandidate(candidates)?.key).toBe("curiousSpecialist");
    expect(
      getCloseSecondCandidate([
        { ...candidates[0], score: 12 },
        { ...candidates[1], score: 8 },
      ]),
    ).toBeNull();
  });

  it("requires profile signals, separation, and lane evidence for high confidence", () => {
    const lanes = [
      createActivityLane({
        confidence: "strong",
        interests: [createProfileInterest("coding", "Coding")],
        key: "builder",
      }),
    ];

    expect(
      getPortraitConfidence(
        createUser({
          interests: Array.from({ length: 6 }, (_, index) =>
            createProfileInterest(`interest-${index}`, `Interest ${index}`),
          ),
          personalityType: "INTJ",
        }),
        {
          agreeableness: 60,
          conscientiousness: 80,
          extraversion: 40,
          neuroticism: 30,
          openness: 88,
        },
        lanes,
        [
          { ...candidates[0], score: 14 },
          { ...candidates[1], score: 9 },
        ],
      ),
    ).toBe("high");
  });

  it("returns early when the portrait has too little supporting evidence", () => {
    expect(
      getPortraitConfidence(
        createUser({ interests: [], personalityType: null }),
        null,
        [],
        candidates,
      ),
    ).toBe("early");
  });
});
