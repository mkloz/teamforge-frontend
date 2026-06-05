import {
  createActivityLane,
  createPersonalityProfile,
  createSocialProfileModel,
  createTraitProfile,
} from "@test/support/factories/profile-insights";
import { describe, expect, it } from "vitest";
import { resolvePortraitCandidates } from "@/features/profile/lib/profile-insights/social-profile/portrait-candidates";

describe("resolvePortraitCandidates", () => {
  it("ranks focused builder for builder lanes, organized traits, and logic-first personality", () => {
    const context = createSocialProfileModel(
      {},
      {
        lanes: [
          createActivityLane({
            confidence: "strong",
            key: "builder",
            primaryEvidenceCount: 3,
            score: 26,
          }),
        ],
        personality: createPersonalityProfile({
          decision: "logic",
          structure: "planned",
          type: "INTJ",
        }),
        traits: createTraitProfile({
          agreeableness: 48,
          conscientiousness: 82,
          extraversion: 38,
          neuroticism: 35,
          openness: 88,
        }),
      },
    ).context;

    expect(resolvePortraitCandidates(context)[0]).toMatchObject({
      key: "focusedBuilder",
    });
  });

  it("falls back to flexible participant when there are no clear signals", () => {
    const context = createSocialProfileModel(
      {},
      {
        lanes: [],
        personality: createPersonalityProfile({
          attention: "unknown",
          decision: "unknown",
          energy: "unknown",
          structure: "unknown",
          type: null,
        }),
        traits: null,
      },
    ).context;

    expect(resolvePortraitCandidates(context)[0]).toMatchObject({
      key: "flexibleParticipant",
      score: 1,
    });
  });

  it("keeps shares non-negative and titles attached to every returned candidate", () => {
    const candidates = resolvePortraitCandidates(
      createSocialProfileModel().context,
    );

    expect(candidates).toHaveLength(3);
    expect(candidates.every((candidate) => candidate.share >= 0)).toBe(true);
    expect(candidates.every((candidate) => candidate.title.length > 0)).toBe(
      true,
    );
  });
});
