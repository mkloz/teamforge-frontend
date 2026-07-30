import { createInterest, createUser } from "@test/support/factories/user";
import { describe, expect, it } from "vitest";
import {
  buildCategoryFitHighlights,
  buildCrossCategoryTemplateSuggestions,
  buildTemplateSuggestions,
} from "@/features/forge/lib/forge-template-suggestions";

describe("forge template personalization", () => {
  it("keeps curated order when there are no personalization signals", () => {
    const suggestions = buildTemplateSuggestions(
      "Food & Drink",
      createUser({ city: null }),
    );

    expect(
      suggestions.slice(0, 3).map((suggestion) => suggestion.title),
    ).toEqual(["Weekend brunch", "New restaurant night", "Cooking night"]);
    expect(suggestions[0]?.badge).toBe("Recommended");
    expect(suggestions[2]?.badge).toBe("Flexible");
  });

  it("uses stable category ids as well as display labels", () => {
    const suggestions = buildTemplateSuggestions(
      "TECH",
      createUser({
        interests: [createInterest("AI", ["machine learning"])],
        oceanC: 76,
      }),
    );

    expect(suggestions[0]?.categoryId).toBe("TECH");
    expect(suggestions[0]?.template.selectedActivity).toBe("Tech & Build");
  });

  it("uses semantic activity text to choose and rank concrete templates", () => {
    const suggestions = buildTemplateSuggestions(
      "football after class",
      createUser({ city: null }),
    );

    expect(suggestions[0]?.categoryId).toBe("SPORTS");
    expect(
      suggestions.slice(0, 3).map((suggestion) => suggestion.title),
    ).toContain("Small-sided football");
  });

  it("does not discard meaningful short interests", () => {
    const suggestions = buildTemplateSuggestions(
      "Tech & Build",
      createUser({
        interests: [createInterest("AI", ["ML tools"])],
        oceanO: 82,
        oceanC: 72,
      }),
    );

    expect(
      suggestions.slice(0, 3).map((suggestion) => suggestion.title),
    ).toContain("AI task workshop");
    expect(
      suggestions.find((suggestion) => suggestion.title === "AI task workshop")
        ?.badge,
    ).toBe("Based on your profile");
  });

  it("ranks concrete user interests above broad category traits", () => {
    const suggestions = buildTemplateSuggestions(
      "Games & Play",
      createUser({
        personalityType: "ENTP",
        oceanO: 80,
        oceanE: 68,
        interests: [createInterest("Board games", ["tabletop", "cards"])],
      }),
    );

    expect(
      suggestions.slice(0, 4).map((suggestion) => suggestion.title),
    ).toEqual([
      "Trading card night",
      "Board game cafe",
      "Strategy game night",
      "Tabletop RPG night",
    ]);
  });

  it("uses the same scoring path for category highlights", () => {
    const highlights = buildCategoryFitHighlights(
      createUser({
        personalityType: "INFJ",
        oceanO: 80,
        oceanC: 72,
        oceanE: 28,
        interests: [createInterest("Books", ["reading", "book club"])],
      }),
    );

    expect(highlights[0]?.categoryId).toBe("LEARNING");
  });

  it("highlights tech for short AI interests instead of dropping the signal", () => {
    const highlights = buildCategoryFitHighlights(
      createUser({
        personalityType: "INTJ",
        oceanO: 78,
        oceanC: 82,
        interests: [createInterest("AI", ["ML tools", "automation"])],
      }),
    );

    expect(highlights[0]?.categoryId).toBe("TECH");
  });

  it("highlights sports for running interests with active traits", () => {
    const highlights = buildCategoryFitHighlights(
      createUser({
        personalityType: "ESTJ",
        oceanC: 74,
        oceanE: 78,
        oceanN: 24,
        interests: [createInterest("Running", ["run club", "training"])],
      }),
    );

    expect(highlights[0]?.categoryId).toBe("SPORTS");
  });

  it("uses activity synonyms when building category highlights", () => {
    const highlights = buildCategoryFitHighlights(
      createUser({
        interests: [createInterest("Movies")],
      }),
    );

    expect(highlights[0]?.categoryId).toBe("ARTS");
  });

  it("does not produce category highlights without real profile signals", () => {
    expect(buildCategoryFitHighlights(createUser({ city: null }))).toEqual([]);
  });

  it("builds profile-ranked landing recommendations from different categories", () => {
    const user = createUser({
      personalityType: "ENTP",
      oceanO: 82,
      interests: [
        createInterest("AI", ["automation", "machine learning"]),
        createInterest("Board games", ["tabletop"]),
        createInterest("Photography", ["photo walks"]),
      ],
    });
    const recommendations = buildCrossCategoryTemplateSuggestions(user);
    const profileCategoryIds = buildCategoryFitHighlights(user).map(
      (item) => item.categoryId,
    );

    expect(recommendations).toHaveLength(3);
    expect(new Set(recommendations.map((item) => item.categoryId)).size).toBe(
      3,
    );
    expect(recommendations.map((item) => item.categoryId)).toEqual(
      profileCategoryIds,
    );
    expect(recommendations.every((item) => item.coverImage)).toBe(true);
  });
});
