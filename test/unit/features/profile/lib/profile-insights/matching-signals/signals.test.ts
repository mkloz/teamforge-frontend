import {
  createActivityLane,
  createLaneForSignal,
  createPersonalityProfile,
  createProfileInterest,
  createSocialProfileModel,
  createTraitProfile,
} from "@test/support/factories/profile-insights";
import { createUser } from "@test/support/factories/user";
import { describe, expect, it } from "vitest";
import { buildMatchingSignals } from "@/features/profile/lib/profile-insights/matching-signals";
import { buildActivitySignal } from "@/features/profile/lib/profile-insights/matching-signals/activity-signal";
import { getMatchingReadiness } from "@/features/profile/lib/profile-insights/matching-signals/matching-readiness";
import { buildPersonalitySignal } from "@/features/profile/lib/profile-insights/matching-signals/personality-signal";
import {
  countUniqueLaneInterests,
  getPersonalitySignalScore,
  getPortraitConfidenceScore,
} from "@/features/profile/lib/profile-insights/matching-signals/signal-metrics";
import { buildStageSignal } from "@/features/profile/lib/profile-insights/matching-signals/stage-signal";

describe("profile matching signals", () => {
  it("builds activity signals from lane confidence and unique evidence", () => {
    const coding = createProfileInterest("coding", "Coding");
    const lanes = [
      createLaneForSignal("builder", "clear", [coding]),
      createLaneForSignal("learning", "clear", [
        coding,
        createProfileInterest("books", "Books"),
      ]),
    ];

    expect(countUniqueLaneInterests(lanes)).toBe(2);
    expect(buildActivitySignal(lanes, lanes[0] ?? null)).toMatchObject({
      label: "Activity read",
      strength: "ready",
      value: "2/2 clear",
    });
  });

  it("builds quiet activity signals when no interests exist", () => {
    expect(buildActivitySignal([], null)).toMatchObject({
      strength: "quiet",
      value: "Missing",
    });
  });

  it("treats missing or non-finite ages as unset life-stage signals", () => {
    expect(buildStageSignal(createUser({ age: null }))).toMatchObject({
      strength: "quiet",
      value: "Unset",
    });
    expect(buildStageSignal(createUser({ age: Number.NaN }))).toMatchObject({
      strength: "quiet",
      value: "Unset",
    });
  });

  it("weights personality signal completeness and mixed cues", () => {
    expect(
      buildPersonalitySignal(
        createPersonalityProfile(),
        createTraitProfile(),
        [],
      ),
    ).toMatchObject({
      strength: "ready",
      value: "INTJ",
    });
    expect(
      buildPersonalitySignal(createPersonalityProfile(), createTraitProfile(), [
        { label: "Tempo", value: "Mixed" },
      ]),
    ).toMatchObject({
      strength: "good",
      value: "Mixed",
    });
    expect(
      getPersonalitySignalScore({
        firstName: "Ada",
        lanes: [],
        personality: createPersonalityProfile(),
        tensions: [{ label: "Tempo", value: "Mixed" }],
        traits: createTraitProfile(),
        user: createUser(),
      }),
    ).toBe(6);
  });

  it("scores matching readiness from lane, portrait, personality, and age evidence", () => {
    expect(getPortraitConfidenceScore("high")).toBe(3);
    expect(getPortraitConfidenceScore("medium")).toBe(2);
    expect(getPortraitConfidenceScore("early")).toBe(0.5);

    expect(getMatchingReadiness(createSocialProfileModel())).toMatchObject({
      label: "High",
      strength: "ready",
    });

    expect(
      getMatchingReadiness(
        createSocialProfileModel(
          { confidence: "early" },
          {
            lanes: [
              createActivityLane({
                confidence: "soft",
                primaryEvidenceCount: 1,
                score: 1,
              }),
            ],
            personality: createPersonalityProfile({ type: null }),
            traits: null,
            user: createUser({ age: Number.NaN }),
          },
        ),
      ),
    ).toMatchObject({
      label: "Early",
      strength: "quiet",
    });
  });

  it("builds the full four-signal set in stable display order", () => {
    expect(
      buildMatchingSignals(createSocialProfileModel()).map(
        (signal) => signal.label,
      ),
    ).toEqual([
      "Activity read",
      "Social read",
      "Life stage",
      "Match confidence",
    ]);
  });
});
