import { describe, expect, it } from "vitest";

import type { User } from "@/shared/schemas";

import {
  buildCategoryFitHighlights,
  buildTemplateSuggestions,
} from "./forge-template-suggestions";

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    avatar: null,
    bio: null,
    authProvider: "EMAIL",
    emailVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    age: 24,
    gender: null,
    city: "London",
    personalityType: null,
    oceanO: null,
    oceanC: null,
    oceanE: null,
    oceanA: null,
    oceanN: null,
    searchStatus: "IDLE",
    trustScore: 80,
    profileComplete: true,
    interests: [],
    ...overrides,
  };
}

function createInterest(name: string, aliases: string[] = []) {
  return {
    id: name,
    name,
    slug: name.toLowerCase().replaceAll(" ", "-"),
    description: null,
    icon: null,
    color: null,
    sortOrder: 0,
    isActive: true,
    parentId: null,
    aliases,
  };
}

describe("forge template personalization", () => {
  it("keeps curated order when there are no personalization signals", () => {
    const suggestions = buildTemplateSuggestions(
      "Food & Drink",
      createUser({ city: null }),
    );

    expect(
      suggestions.slice(0, 3).map((suggestion) => suggestion.title),
    ).toEqual(["Brunch table", "New spot vote", "Cook together"]);
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
    ).toContain("AI tool test");
    expect(
      suggestions.find((suggestion) => suggestion.title === "AI tool test")
        ?.badge,
    ).toBe("Personal fit");
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
      "Card draft table",
      "RPG one-shot",
      "Hidden-role night",
      "Board game rotation",
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

  it("does not produce category highlights without real profile signals", () => {
    expect(buildCategoryFitHighlights(createUser({ city: null }))).toEqual([]);
  });
});
