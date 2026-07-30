import { describe, expect, it } from "vitest";

import { buildGroupNameSuggestions } from "@/features/forge/lib/group-identity/group-name-suggestions";

describe("buildGroupNameSuggestions", () => {
  it("uses the plan topic and location before the broad category", () => {
    expect(
      buildGroupNameSuggestions({
        planTitle: "Comedy Crowd - Elizabeth",
        selectedActivity: "Projects & Wildcards",
      }),
    ).toEqual([
      "Elizabeth Comedy Club",
      "Comedy in Elizabeth",
      "Comedy Night",
      "The Comedy Table",
    ]);
  });

  it("uses exact TeamForge category labels for fallback suggestions", () => {
    expect(
      buildGroupNameSuggestions({
        selectedActivity: "Tech & Build",
      }),
    ).toEqual([
      "Side Project Club",
      "Build Together",
      "Product People",
      "Tech Meetup",
    ]);
  });

  it("prefers the specific plan topic over a general category", () => {
    expect(
      buildGroupNameSuggestions({
        planTitle: "Beginner photography walk",
        selectedActivity: "Study & Skills",
      }),
    ).toEqual([
      "Local Photo Walk",
      "Camera Club",
      "Photo Walkers",
      "Photography Meetup",
    ]);
  });

  it("filters existing names using punctuation and case-insensitive keys", () => {
    const suggestions = buildGroupNameSuggestions({
      existingGroupNames: ["camera club", "LOCAL PHOTO-WALK"],
      planTitle: "Beginner photography walk",
      selectedActivity: "Study & Skills",
    });

    expect(suggestions).toHaveLength(4);
    expect(suggestions).not.toContain("Camera Club");
    expect(suggestions).not.toContain("Local Photo Walk");
  });

  it("never returns more than four suggestions", () => {
    expect(
      buildGroupNameSuggestions({
        selectedActivity: "Food & Drink",
        suggestionCount: 20,
      }),
    ).toHaveLength(4);
  });

  it("does not return the synthetic vocabulary used by the old pools", () => {
    const suggestions = buildGroupNameSuggestions({
      selectedActivity: "Projects & Wildcards",
    });

    expect(suggestions.join(" ")).not.toMatch(
      /\b(assembly|cohort|collective|flux|forge|squad|unit)\b/i,
    );
  });
});
