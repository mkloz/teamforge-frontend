import { describe, expect, it } from "vitest";

import { buildActivityIdeas } from "@/features/profile/lib/profile-insights/activity-ideas";
import { buildActivityEventDescription } from "@/features/profile/lib/profile-insights/activity-ideas/activity-event-description";
import {
  buildActivityIdeaContext,
  getActivityIdeaAnchorPool,
  getActivitySocialPressure,
  getActivityStructure,
} from "@/features/profile/lib/profile-insights/activity-ideas/activity-idea-context";
import { createActivityIdea } from "@/features/profile/lib/profile-insights/activity-ideas/activity-idea-factory";
import { rankActivityIdeas } from "@/features/profile/lib/profile-insights/activity-ideas/activity-idea-ranking";
import { buildSpecificActivityIdeas } from "@/features/profile/lib/profile-insights/activity-ideas/specific-activity-ideas";
import {
  createActivityLane,
  createPersonalityProfile,
  createProfileInterest,
  createSocialProfileModel,
  createTraitProfile,
} from "../../../../../factories/profile-insights";

describe("activity idea context", () => {
  it("chooses social pressure and structure from personality and trait cues", () => {
    expect(
      getActivitySocialPressure(
        createSocialProfileModel(
          {},
          {
            personality: createPersonalityProfile({ energy: "inward" }),
            traits: createTraitProfile({
              agreeableness: 50,
              conscientiousness: 50,
              extraversion: 88,
              neuroticism: 50,
              openness: 50,
            }),
          },
        ),
      ),
    ).toBe("easy");

    expect(
      getActivityStructure(
        createSocialProfileModel(
          {},
          {
            personality: createPersonalityProfile({ structure: "planned" }),
            traits: createTraitProfile({
              agreeableness: 50,
              conscientiousness: 30,
              extraversion: 50,
              neuroticism: 50,
              openness: 50,
            }),
          },
        ),
      ),
    ).toBe("framed");
  });

  it("deduplicates primary anchors and uses clear secondary lane interests in the pool", () => {
    const coding = createProfileInterest("coding", " Coding ");
    const duplicateCoding = createProfileInterest("coding-duplicate", "Coding");
    const primaryLane = createActivityLane({
      evidence: [
        { interest: coding, reason: "direct", role: "primary", score: 8 },
        {
          interest: duplicateCoding,
          reason: "direct",
          role: "primary",
          score: 7,
        },
        {
          interest: createProfileInterest("soft", "Soft hint"),
          reason: "context",
          role: "supporting",
          score: 2,
        },
      ],
      interests: [coding, duplicateCoding],
      key: "builder",
      primaryEvidenceCount: 2,
    });
    const secondaryLane = createActivityLane({
      confidence: "clear",
      interests: [createProfileInterest("coffee", "Coffee")],
      key: "food",
    });
    const context = buildActivityIdeaContext(
      primaryLane,
      [primaryLane, secondaryLane],
      createSocialProfileModel(),
    );

    expect(context.anchors).toEqual(["Coding"]);
    expect(
      getActivityIdeaAnchorPool(context).map((interest) => interest.name),
    ).toEqual([" Coding ", "Coding", "Coffee"]);
  });
});

describe("activity idea ranking and factory", () => {
  it("deduplicates title variants and keeps the highest scoring idea", () => {
    const context = buildActivityIdeaContext(
      createActivityLane({ key: "food", score: 8 }),
      [],
      createSocialProfileModel(),
    );
    const ideas = rankActivityIdeas([
      createActivityIdea(context, {
        detail: "Lower",
        eventDescription: " Lower event ",
        scoreBonus: 1,
        title: " Café walk ",
      }),
      createActivityIdea(context, {
        detail: "Higher",
        eventDescription: "Higher event",
        scoreBonus: 5,
        title: "cafe   walk",
      }),
    ]);

    expect(ideas).toHaveLength(1);
    expect(ideas[0]).toMatchObject({
      detail: "Higher",
      eventDescription: "Higher event",
      title: "cafe   walk",
    });
  });

  it("adds personality and secondary lane score into candidate scoring", () => {
    const primaryLane = createActivityLane({
      confidence: "strong",
      key: "builder",
      score: 20,
    });
    const context = buildActivityIdeaContext(
      primaryLane,
      [
        primaryLane,
        createActivityLane({
          confidence: "clear",
          key: "learning",
          score: 10,
        }),
      ],
      createSocialProfileModel(),
    );

    expect(
      createActivityIdea(context, {
        detail: "Detail",
        scoreBonus: 2,
        title: "Builder topic",
      }).score,
    ).toBeGreaterThan(26);
  });
});

describe("specific and generated activity ideas", () => {
  it("detects photo plus cafe anchors after text normalization", () => {
    const primaryLane = createActivityLane({
      confidence: "strong",
      interests: [
        createProfileInterest("photo", "Photography"),
        createProfileInterest("cafe", "Café"),
      ],
      key: "creative",
      score: 20,
    });
    const context = buildActivityIdeaContext(
      primaryLane,
      [
        primaryLane,
        createActivityLane({
          confidence: "clear",
          interests: [createProfileInterest("coffee", "Coffee")],
          key: "food",
        }),
      ],
      createSocialProfileModel(),
    );

    expect(buildSpecificActivityIdeas(context)[0]).toMatchObject({
      title: "Photo walk with a coffee stop",
    });
  });

  it("builds fallback ideas when no lanes exist and caps generated ideas to four", () => {
    expect(buildActivityIdeas([], createSocialProfileModel())).toEqual([
      expect.objectContaining({
        confidence: "soft",
        laneKey: "general",
        secondaryLaneKey: null,
        title: "Interest-led small group",
      }),
    ]);

    expect(
      buildActivityIdeas(
        [
          createActivityLane({
            confidence: "strong",
            interests: [
              createProfileInterest("photo", "Photography"),
              createProfileInterest("cafe", "Cafe"),
            ],
            key: "creative",
            score: 22,
          }),
          createActivityLane({
            confidence: "clear",
            interests: [createProfileInterest("coffee", "Coffee")],
            key: "food",
          }),
        ],
        createSocialProfileModel(),
      ),
    ).toHaveLength(3);
  });

  it("builds event descriptions from pressure, anchors, and structure", () => {
    const primaryLane = createActivityLane({
      evidence: [
        {
          interest: createProfileInterest("books", "Books"),
          reason: "direct",
          role: "primary",
          score: 8,
        },
      ],
      key: "learning",
    });
    const context = buildActivityIdeaContext(
      primaryLane,
      [primaryLane],
      createSocialProfileModel(
        {},
        {
          personality: createPersonalityProfile({
            energy: "inward",
            structure: "planned",
          }),
        },
      ),
    );

    expect(
      buildActivityEventDescription(context, "Topic-first mini group"),
    ).toContain("3-5 people");
    expect(
      buildActivityEventDescription(context, "Topic-first mini group"),
    ).toContain("Books");
    expect(
      buildActivityEventDescription(context, "Topic-first mini group"),
    ).toContain("one clear start time");
  });
});
