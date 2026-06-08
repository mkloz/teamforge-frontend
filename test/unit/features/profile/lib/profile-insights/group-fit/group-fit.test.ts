import {
  createActivityLane,
  createPersonalityProfile,
  createProfileInterest,
  createSocialProfileModel,
} from "@test/support/factories/profile-insights";
import { describe, expect, it } from "vitest";
import { buildGroupFit } from "@/features/profile/lib/profile-insights/group-fit";
import {
  buildGroupFitAvoid,
  buildGroupFitBestWith,
  buildGroupFitOpeningMove,
  buildPortraitChemistry,
} from "@/features/profile/lib/profile-insights/group-fit/group-fit-recommendations";
import { getGroupFitStyle } from "@/features/profile/lib/profile-insights/group-fit/group-fit-style";
import {
  buildPortraitGroupSignals,
  buildPortraitGroupSummary,
} from "@/features/profile/lib/profile-insights/group-fit/group-fit-summary";
import { buildUserGroupSignal } from "@/features/profile/lib/profile-insights/group-fit/user-group-signal";
import type { ActivityIdea } from "@/features/profile/lib/profile-insights/types";

function createOpeningIdea(
  overrides: Partial<ActivityIdea> = {},
): ActivityIdea {
  return {
    confidence: "clear",
    detail: "Bring one rough idea and make it concrete.",
    eventDescription: "A concrete builder event.",
    laneKey: "builder",
    secondaryLaneKey: null,
    title: "Idea session around one rough prompt",
    ...overrides,
  };
}

describe("group fit", () => {
  it("returns empty and missing-activity states for sparse profiles", () => {
    expect(
      buildGroupFit(
        createSocialProfileModel(
          {},
          {
            lanes: [],
            personality: createPersonalityProfile({ type: null }),
            traits: null,
          },
        ),
        [],
      ),
    ).toMatchObject({
      title: "Fit still forming",
    });

    expect(
      buildGroupFit(
        createSocialProfileModel(
          {},
          {
            lanes: [],
          },
        ),
        [],
      ),
    ).toMatchObject({
      title: "Fit needs an activity",
    });
  });

  it("builds complete group fit output from portrait, lane, and opening idea", () => {
    const lane = createActivityLane({
      confidence: "strong",
      interests: [createProfileInterest("coding", "Coding")],
      key: "builder",
      label: "Builder energy",
      primaryEvidenceCount: 3,
      score: 24,
    });
    const socialProfile = createSocialProfileModel(
      {
        candidates: [
          {
            key: "focusedBuilder",
            score: 12,
            share: 0.7,
            title: "Focused Builder",
          },
          {
            key: "curiousSpecialist",
            score: 10.8,
            share: 0.3,
            title: "Curious Specialist",
          },
        ],
        primaryKey: "focusedBuilder",
      },
      {
        lanes: [lane],
      },
    );
    const fit = buildGroupFit(socialProfile, [createOpeningIdea()]);

    expect(fit).toMatchObject({
      openingMove:
        "Idea session around one rough prompt. Bring one rough idea and make it concrete.",
      title: "Builder-minded fit",
    });
    expect(fit.summary).toContain("ideas can turn into something concrete");
    expect(fit.signals).toContain(
      "Best first move: Idea session around one rough prompt.",
    );
  });

  it("maps every portrait key to a group fit style", () => {
    expect(getGroupFitStyle("focusedBuilder")).toEqual({
      posture: "builder",
      title: "Builder-minded fit",
    });
    expect(getGroupFitStyle("warmConnector").posture).toBe("connector");
  });

  it("builds recommendation copy from posture, tensions, and opening ideas", () => {
    const socialProfile = createSocialProfileModel(
      {},
      {
        tensions: [{ label: "Mixed cue", value: "Mixed detail." }],
      },
    );
    const idea = createOpeningIdea();

    expect(
      buildGroupFitBestWith("focusedBuilder", socialProfile, idea),
    ).toContain("real shared focus");
    expect(buildGroupFitAvoid("focusedBuilder", socialProfile)).toContain(
      "one cue too literally",
    );
    expect(buildPortraitChemistry("focusedBuilder", socialProfile)).toContain(
      "Mixed detail.",
    );
  });

  it("builds summaries, signals, and user group defaults", () => {
    const socialProfile = createSocialProfileModel(
      {
        secondaryCandidate: {
          key: "curiousSpecialist",
          score: 9,
          share: 0.4,
          title: "Curious Specialist",
        },
      },
      {
        lanes: [
          createActivityLane({
            confidence: "strong",
            key: "builder",
            primaryEvidenceCount: 2,
          }),
          createActivityLane({
            confidence: "clear",
            key: "learning",
            label: "Curious thread",
          }),
        ],
      },
    );

    expect(
      buildPortraitGroupSummary(
        "focusedBuilder",
        socialProfile,
        socialProfile.secondaryCandidate,
      ),
    ).toContain("curious specialist side");
    expect(
      buildPortraitGroupSignals(
        "focusedBuilder",
        socialProfile,
        socialProfile.context.lanes[0] ?? null,
        createOpeningIdea(),
      ),
    ).toHaveLength(4);
    expect(buildGroupFitOpeningMove(null, null)).toBe(
      "Start with a simple interest-led group while more profile detail builds.",
    );
    expect(buildUserGroupSignal("steadyHost").connectionStyle.value).toBe(
      "Curious",
    );
  });
});
