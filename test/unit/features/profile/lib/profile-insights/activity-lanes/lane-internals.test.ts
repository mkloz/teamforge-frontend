import { createProfileInterest } from "@test/support/factories/profile-insights";
import { describe, expect, it } from "vitest";
import { getActivityLaneConfidence } from "@/features/profile/lib/profile-insights/activity-lanes/lane-confidence";
import {
  applyLaneEvidence,
  getLaneEvidenceCounts,
  sortLaneEvidence,
} from "@/features/profile/lib/profile-insights/activity-lanes/lane-evidence";
import { rankLaneBuckets } from "@/features/profile/lib/profile-insights/activity-lanes/lane-ranking";
import type {
  ActivityLaneEvidence,
  LaneBucket,
  LaneKey,
  LaneMatch,
} from "@/features/profile/lib/profile-insights/types";

function createLaneMatch(overrides: Partial<LaneMatch> = {}): LaneMatch {
  return {
    key: "builder",
    rawScore: 8,
    reason: "direct",
    role: "primary",
    score: 8,
    ...overrides,
  };
}

function createEvidence(
  interestName: string,
  overrides: Partial<ActivityLaneEvidence> = {},
): ActivityLaneEvidence {
  return {
    interest: createProfileInterest(interestName.toLowerCase(), interestName),
    reason: "direct",
    role: "primary",
    score: 8,
    ...overrides,
  };
}

describe("activity lane internals", () => {
  it("maps score and evidence counts to stable confidence levels", () => {
    expect(getActivityLaneConfidence(22, 3, 0)).toBe("strong");
    expect(getActivityLaneConfidence(14, 1, 0)).toBe("clear");
    expect(getActivityLaneConfidence(8, 1, 2)).toBe("clear");
    expect(getActivityLaneConfidence(8, 1, 0)).toBe("soft");
  });

  it("does not promote confidence from non-finite or negative scores", () => {
    expect(getActivityLaneConfidence(Number.POSITIVE_INFINITY, 0, 0)).toBe(
      "soft",
    );
    expect(getActivityLaneConfidence(Number.NaN, 3, 0)).toBe("soft");
    expect(getActivityLaneConfidence(-20, 3, 0)).toBe("soft");
  });

  it("merges duplicate evidence by keeping the strongest lane match", () => {
    const interest = createProfileInterest("coding", "Coding");
    const lane: LaneBucket = { evidence: [], score: 0 };

    expect(applyLaneEvidence(lane, interest, createLaneMatch())).toBe(8);
    expect(
      applyLaneEvidence(
        lane,
        interest,
        createLaneMatch({
          rawScore: 5,
          role: "supporting",
          score: 5,
        }),
      ),
    ).toBe(0);
    expect(
      applyLaneEvidence(
        lane,
        interest,
        createLaneMatch({
          rawScore: 10,
          reason: "mixed",
          score: 10,
        }),
      ),
    ).toBe(2);

    expect(lane.evidence).toEqual([
      {
        interest,
        reason: "mixed",
        role: "primary",
        score: 10,
      },
    ]);
  });

  it("sorts primary evidence first, then by score and display name", () => {
    const evidence = [
      createEvidence("Zulu", { role: "supporting", score: 10 }),
      createEvidence("Beta", { role: "primary", score: 8 }),
      createEvidence("Alpha", { role: "primary", score: 8 }),
      createEvidence("Gamma", { role: "primary", score: 12 }),
    ];

    expect(
      sortLaneEvidence(evidence).map((item) => [
        item.interest.name,
        item.role,
        item.score,
      ]),
    ).toEqual([
      ["Gamma", "primary", 12],
      ["Alpha", "primary", 8],
      ["Beta", "primary", 8],
      ["Zulu", "supporting", 10],
    ]);
    expect(getLaneEvidenceCounts(evidence)).toEqual({
      primaryEvidenceCount: 3,
      supportingEvidenceCount: 1,
    });
  });

  it("ranks lane buckets by score, evidence depth, then product priority", () => {
    const grouped = new Map<LaneKey, LaneBucket>([
      [
        "builder",
        {
          evidence: [createEvidence("Coding")],
          score: 12,
        },
      ],
      [
        "creative",
        {
          evidence: [createEvidence("Design"), createEvidence("Music")],
          score: 12,
        },
      ],
      [
        "outdoors",
        {
          evidence: [createEvidence("Hiking"), createEvidence("Climbing")],
          score: 12,
        },
      ],
      [
        "food",
        {
          evidence: [createEvidence("Coffee")],
          score: 18,
        },
      ],
    ]);

    expect(rankLaneBuckets(grouped).map(([key]) => key)).toEqual([
      "food",
      "outdoors",
      "creative",
      "builder",
    ]);
  });
});
