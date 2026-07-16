import { createProfileInterest } from "@test/support/factories/profile-insights";
import { createUser } from "@test/support/factories/user";
import { describe, expect, it } from "vitest";
import type { OceanScores } from "@/features/profile/lib/profile-contract";
import { buildProfileInsights } from "@/features/profile/lib/profile-insights";

const focusedBuilderScores: OceanScores = {
  agreeableness: 54,
  conscientiousness: 84,
  extraversion: 42,
  neuroticism: 28,
  openness: 88,
};

describe("buildProfileInsights", () => {
  it("builds a complete insight model from user interests, MBTI, and OCEAN scores", () => {
    const insights = buildProfileInsights(
      createUser({
        age: 24,
        interests: [
          createProfileInterest("coding", "Coding", {
            aliases: ["software"],
          }),
          createProfileInterest("ai-tools", "AI tools"),
          createProfileInterest("startups", "Startups"),
          createProfileInterest("books", "Books"),
        ],
        name: "Mira Chen",
        personalityType: "INTJ",
      }),
      focusedBuilderScores,
    );

    expect(insights.activityLanes[0]).toMatchObject({
      confidence: "strong",
      key: "builder",
      primaryEvidenceCount: 3,
    });
    expect(insights.activityLanes.map((lane) => lane.key)).toContain(
      "learning",
    );
    expect(insights.activityIdeas[0]).toMatchObject({
      confidence: "strong",
      laneKey: "builder",
    });
    expect(insights.matchingSignals).toHaveLength(4);
    expect(insights.matchingSignals.map((signal) => signal.label)).toEqual([
      "Activity read",
      "Personality detail",
      "Life stage",
      "Profile detail",
    ]);
    expect(insights.portrait.confidence).not.toBe("early");
    expect(insights.portrait.title).toBe(
      "The person who turns talk into a prototype",
    );
    expect(insights.portrait.candidates[0]).toMatchObject({
      key: "focusedBuilder",
    });
    expect(insights.portrait.lead).toContain("Mira");
    expect(insights.groupFit).toMatchObject({
      title: "Builder-minded fit",
    });
    expect(insights.groupFit.openingMove).toContain(
      insights.activityIdeas[0]?.title,
    );
  });

  it("returns gentle fallback insight states for sparse profiles", () => {
    const insights = buildProfileInsights(
      createUser({
        age: null,
        interests: [],
        name: " ",
        personalityType: null,
      }),
      null,
    );

    expect(insights.activityLanes).toEqual([]);
    expect(insights.activityIdeas).toEqual([
      expect.objectContaining({
        confidence: "soft",
        laneKey: "general",
        title: "Interest-led small group",
      }),
    ]);
    expect(insights.matchingSignals).toHaveLength(4);
    expect(insights.portrait).toMatchObject({
      confidence: "early",
      mode: "focused",
    });
    expect(insights.portrait.candidates[0]).toMatchObject({
      key: "flexibleParticipant",
    });
    expect(insights.portrait.lead).toContain("This profile");
    expect(insights.groupFit).toMatchObject({
      title: "Add details to see group fit",
    });
  });

  it("ignores inactive interests and semantic duplicates before scoring the pipeline", () => {
    const insights = buildProfileInsights(
      createUser({
        interests: [
          createProfileInterest("coding-primary", "Coding", {
            aliases: ["software"],
            slug: "coding",
          }),
          createProfileInterest("coding-copy", " Coding ", {
            slug: "coding",
          }),
          createProfileInterest("inactive-coffee", "Coffee", {
            isActive: false,
          }),
        ],
        personalityType: "INTJ",
      }),
      focusedBuilderScores,
    );

    expect(insights.activityLanes).toHaveLength(1);
    expect(insights.activityLanes[0]).toMatchObject({
      key: "builder",
      primaryEvidenceCount: 1,
    });
    expect(
      insights.activityLanes[0]?.interests.map((interest) => interest.id),
    ).toEqual(["coding-primary"]);
    expect(insights.activityLanes.some((lane) => lane.key === "food")).toBe(
      false,
    );
    expect(insights.groupFit.summary).toContain("Coding");
  });
});
