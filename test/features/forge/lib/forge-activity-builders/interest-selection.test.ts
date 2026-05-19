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

  it("falls back to the first ten user interests when no activity keywords match", () => {
    const interests = Array.from({ length: 12 }, (_, index) =>
      createInterest(`Interest ${index + 1}`, [], { id: `interest-${index}` }),
    );

    expect(
      selectInterestIds(createUser({ interests }), "Tiny niche gathering"),
    ).toEqual(interests.slice(0, 10).map((interest) => interest.id));
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
