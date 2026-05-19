import { describe, expect, it } from "vitest";

import { selectInterestIds } from "@/features/forge/lib/forge-activity-builders/interest-selection";
import { createInterest, createUser } from "../../../../factories/user";

describe("selectInterestIds", () => {
  it("prioritizes interests matching a resolved activity category", () => {
    const user = createUser({
      interests: [
        createInterest("Cooking", [], { id: "cooking" }),
        createInterest("Coding", ["AI"], { id: "coding" }),
        createInterest("Board games", [], { id: "board_games" }),
      ],
    });

    expect(selectInterestIds(user, "TECH")).toEqual(["coding"]);
  });

  it("uses resolved category semantic terms to recover related user interests", () => {
    const user = createUser({
      interests: [
        createInterest("Soccer", [], { id: "soccer" }),
        createInterest("Cinema", [], { id: "cinema" }),
        createInterest("Coding", [], { id: "coding" }),
      ],
    });

    expect(selectInterestIds(user, "football after class")).toEqual(["soccer"]);
  });

  it("keeps exact activity wording ahead of broader category interest matches", () => {
    const user = createUser({
      interests: [
        createInterest("Basketball", [], { id: "basketball" }),
        createInterest("Football", [], { id: "football" }),
        createInterest("Soccer", [], { id: "soccer" }),
      ],
    });

    expect(selectInterestIds(user, "football after class")).toEqual([
      "football",
      "basketball",
      "soccer",
    ]);
  });

  it("falls back to the first ten user interests when no activity keywords match", () => {
    const interests = Array.from({ length: 12 }, (_, index) =>
      createInterest(`Interest ${index + 1}`, [], { id: `interest-${index}` }),
    );

    expect(
      selectInterestIds(createUser({ interests }), "Tiny niche gathering"),
    ).toEqual(interests.slice(0, 10).map((interest) => interest.id));
  });

  it("ranks direct matches above alias matches and supports fuzzy typo matches", () => {
    const user = createUser({
      interests: [
        createInterest("Software engineering", ["coding"], {
          id: "software_eng",
        }),
        createInterest("Coffee", [], { id: "coffee" }),
        createInterest("Coding", [], { id: "coding" }),
      ],
    });

    expect(selectInterestIds(user, "coding session")).toEqual([
      "coding",
      "software_eng",
    ]);
    expect(selectInterestIds(user, "cofee meetup")).toEqual(["coffee"]);
  });

  it("ignores inactive interests for matches and fallback ids", () => {
    const user = createUser({
      interests: [
        createInterest("Coding", [], { id: "coding", isActive: false }),
        createInterest("Board games", [], { id: "board_games" }),
        createInterest("Cooking", [], { id: "cooking", isActive: false }),
      ],
    });

    expect(selectInterestIds(user, "TECH")).toEqual(["board_games"]);
    expect(selectInterestIds(user, null)).toEqual(["board_games"]);
  });

  it("deduplicates selected interest ids while preserving ranking order", () => {
    const duplicateA = createInterest("Coding", [], { id: "coding" });
    const duplicateB = createInterest("Coding", ["startup"], { id: "coding" });
    const user = createUser({
      interests: [
        duplicateA,
        duplicateB,
        createInterest("Startups", [], { id: "startups" }),
      ],
    });

    expect(selectInterestIds(user, "Tech & Build")).toEqual([
      "coding",
      "startups",
    ]);
  });
});
