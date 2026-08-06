import { createInterest } from "@test/support/factories/user";
import { describe, expect, it } from "vitest";
import { canContinueInterests } from "@/features/onboarding/hooks/use-interests";
import {
  getCorrelatedSuggestions,
  getMbtiSuggestions,
  getSearchResults,
  getShouldShowBalanceNudge,
} from "@/features/onboarding/utils/interest-logic";
import type { Interest } from "@/shared/schemas";

function node(
  id: string,
  name: string,
  aliases: string[] = [],
  children: Interest[] = [],
  overrides: Partial<Interest> = {},
): Interest {
  return createInterest(name, aliases, {
    children,
    id,
    slug: id,
    ...overrides,
  });
}

function createCatalog() {
  const cooking = node("cooking", "Cooking", ["home chef"]);
  const baking = node("baking", "Baking", ["pastry"]);
  const restaurants = node("restaurants_foodie", "Restaurants", ["foodie"]);
  const food = node(
    "food_subcategory",
    "Food & Drink",
    [],
    [cooking, baking, restaurants],
  );

  const softwareEng = node("software_eng", "Software engineering", ["coding"]);
  const dataScience = node("data_science", "Data science");
  const specialtyCoffee = node("specialty_coffee", "Specialty coffee");
  const pcGaming = node("pc_gaming", "PC gaming");
  const coding = node("coding", "Coding");
  const chess = node("chess", "Chess");
  const cybersecurity = node("cybersecurity", "Cybersecurity");
  const pcBuilding = node("pc_building", "PC building");
  const physics = node("physics", "Physics");
  const tech = node(
    "tech_subcategory",
    "Tech & Build",
    [],
    [
      softwareEng,
      dataScience,
      specialtyCoffee,
      pcGaming,
      coding,
      chess,
      cybersecurity,
      pcBuilding,
      physics,
    ],
  );

  const lifestyleCategory = node("lifestyle", "Lifestyle", [], [food]);
  const techCategory = node("technology", "Technology", [], [tech]);
  const categories = [lifestyleCategory, techCategory];
  const leaves = [
    cooking,
    baking,
    restaurants,
    softwareEng,
    dataScience,
    specialtyCoffee,
    pcGaming,
    coding,
    chess,
    cybersecurity,
    pcBuilding,
    physics,
  ];
  const leafById = Object.fromEntries(
    leaves.map((interest) => [interest.id, interest]),
  );

  return { categories, leafById };
}

describe("getMbtiSuggestions", () => {
  it("returns known MBTI suggestions, ignores missing ids, and moves selected items last", () => {
    const { leafById } = createCatalog();

    expect(
      getMbtiSuggestions(
        "INTJ",
        leafById,
        new Set(["coding"]),
        new Set(["software_eng"]),
      ).map((interest) => interest.id),
    ).toEqual([
      "data_science",
      "physics",
      "chess",
      "pc_gaming",
      "specialty_coffee",
      "coding",
    ]);
  });

  it("returns no suggestions when there is no personality type", () => {
    const { leafById } = createCatalog();

    expect(getMbtiSuggestions(null, leafById, new Set(), new Set())).toEqual(
      [],
    );
  });

  it("skips inactive MBTI suggestions before ranking selected items", () => {
    const { leafById } = createCatalog();
    const leafByIdWithInactive = {
      ...leafById,
      pc_gaming: {
        ...leafById.pc_gaming,
        isActive: false,
      },
    };

    expect(
      getMbtiSuggestions(
        "INTJ",
        leafByIdWithInactive,
        new Set(["coding"]),
        new Set(["software_eng"]),
      ).map((interest) => interest.id),
    ).toEqual([
      "data_science",
      "physics",
      "chess",
      "specialty_coffee",
      "coding",
    ]);
  });
});

describe("getSearchResults", () => {
  it("finds subcategories, tag names, and aliases using normalized fuzzy search", () => {
    const { categories } = createCatalog();
    const cafes = node(
      "cafes",
      "Cafés",
      [],
      [node("coffee", "Coffee meetups", ["cafe"])],
    );
    const results = getSearchResults(" cafe ", [
      node("places", "Places", [], [cafes]),
      ...categories,
    ]);

    expect(
      results.subcategories.map(({ subcategory }) => subcategory.id),
    ).toContain("cafes");
    expect(results.tags.map(({ tag }) => tag.id)).toContain("coffee");
  });

  it("returns matched aliases for tag alias hits", () => {
    const { categories } = createCatalog();
    const results = getSearchResults("pastry", categories);

    expect(results.tags).toEqual([
      expect.objectContaining({
        matchedAlias: "pastry",
        tag: expect.objectContaining({ id: "baking" }),
      }),
    ]);
  });

  it("ranks exact tag names above alias hits and keeps matched alias detail", () => {
    const { categories } = createCatalog();
    const results = getSearchResults("coding", categories);

    expect(results.tags.slice(0, 2)).toEqual([
      expect.objectContaining({
        matchedAlias: undefined,
        tag: expect.objectContaining({ id: "coding" }),
      }),
      expect.objectContaining({
        matchedAlias: "coding",
        tag: expect.objectContaining({ id: "software_eng" }),
      }),
    ]);
  });

  it("ignores inactive categories, subcategories, and tags", () => {
    const hiddenTag = node("hidden_tag", "Hidden tag", [], [], {
      isActive: false,
    });
    const hiddenSubcategory = node(
      "hidden_subcategory",
      "Hidden subcategory",
      [],
      [node("visible_under_hidden", "Hidden child")],
      { isActive: false },
    );
    const hiddenCategory = node(
      "hidden_category",
      "Hidden category",
      [],
      [node("visible_under_hidden_category", "Hidden child")],
      { isActive: false },
    );
    const visibleCategory = node(
      "visible_category",
      "Visible category",
      [],
      [
        node("visible_subcategory", "Visible subcategory", [], [hiddenTag]),
        hiddenSubcategory,
      ],
    );

    const results = getSearchResults("hidden", [
      visibleCategory,
      hiddenCategory,
    ]);

    expect(results).toEqual({ subcategories: [], tags: [] });
  });

  it("ignores queries that are too short after trimming", () => {
    const { categories } = createCatalog();

    expect(getSearchResults(" c ", categories)).toEqual({
      subcategories: [],
      tags: [],
    });
  });
});

describe("getCorrelatedSuggestions", () => {
  it("requires two unique selected interests before suggesting correlations", () => {
    const { categories, leafById } = createCatalog();

    expect(
      getCorrelatedSuggestions(
        ["software_eng", "software_eng"],
        new Set(),
        new Set(),
        leafById,
        categories,
      ),
    ).toEqual([]);
  });

  it("ranks overlapping explicit correlations above single-hit candidates", () => {
    const { categories, leafById } = createCatalog();

    expect(
      getCorrelatedSuggestions(
        ["software_eng", "data_science"],
        new Set(),
        new Set(),
        leafById,
        categories,
      )
        .slice(0, 3)
        .map((interest) => interest.id),
    ).toEqual(["specialty_coffee", "pc_gaming", "coding"]);
  });

  it("uses same-subcategory siblings while excluding selected, rejected, and already suggested ids", () => {
    const { categories, leafById } = createCatalog();

    expect(
      getCorrelatedSuggestions(
        ["cooking", "restaurants_foodie"],
        new Set(["baking"]),
        new Set(["specialty_coffee"]),
        leafById,
        categories,
      ).map((interest) => interest.id),
    ).toEqual([]);
  });

  it("requires two known active selected interests and skips inactive candidates before limiting", () => {
    const { categories, leafById } = createCatalog();
    const leafByIdWithInactive = {
      ...leafById,
      pc_gaming: {
        ...leafById.pc_gaming,
        isActive: false,
      },
    };

    expect(
      getCorrelatedSuggestions(
        ["software_eng", "unknown_selected"],
        new Set(),
        new Set(),
        leafByIdWithInactive,
        categories,
      ),
    ).toEqual([]);

    expect(
      getCorrelatedSuggestions(
        ["software_eng", "data_science"],
        new Set(),
        new Set(),
        leafByIdWithInactive,
        categories,
      ).map((interest) => interest.id),
    ).not.toContain("pc_gaming");
  });
});

describe("getShouldShowBalanceNudge", () => {
  it("shows a balance nudge when more than 70 percent of known selections sit in one category", () => {
    const { categories } = createCatalog();

    expect(
      getShouldShowBalanceNudge(
        [
          "software_eng",
          "data_science",
          "specialty_coffee",
          "pc_gaming",
          "coding",
          "chess",
          "cybersecurity",
          "pc_building",
          "cooking",
          "baking",
          "stale-id",
        ],
        categories,
      ),
    ).toBe(true);
  });

  it("does not show a balance nudge at exactly 70 percent or with too few known selections", () => {
    const { categories } = createCatalog();

    expect(
      getShouldShowBalanceNudge(
        [
          "software_eng",
          "data_science",
          "specialty_coffee",
          "pc_gaming",
          "coding",
          "chess",
          "cybersecurity",
          "cooking",
          "baking",
          "restaurants_foodie",
          "stale-id",
        ],
        categories,
      ),
    ).toBe(false);

    expect(getShouldShowBalanceNudge(["software_eng"], categories)).toBe(false);
  });

  it("ignores inactive catalog branches when deciding whether selections are balanced", () => {
    const inactiveLeaf = node("inactive_leaf", "Inactive leaf", [], [], {
      isActive: false,
    });
    const activeLeaf = node("active_leaf", "Active leaf");
    const category = node(
      "category",
      "Category",
      [],
      [node("subcategory", "Subcategory", [], [inactiveLeaf, activeLeaf])],
    );

    expect(
      getShouldShowBalanceNudge(
        [
          "active_leaf",
          "inactive_leaf",
          "inactive_leaf",
          "inactive_leaf",
          "inactive_leaf",
          "inactive_leaf",
          "inactive_leaf",
          "inactive_leaf",
          "inactive_leaf",
          "inactive_leaf",
        ],
        [category],
      ),
    ).toBe(false);
  });
});

describe("starter interest threshold", () => {
  it("keeps nine interests blocked and allows exactly ten across two categories", () => {
    expect(canContinueInterests(9, 2)).toBe(false);
    expect(canContinueInterests(10, 1)).toBe(false);
    expect(canContinueInterests(10, 2)).toBe(true);
  });
});
