import {
  type Category,
  INTEREST_CATEGORIES,
  type LeafTag,
} from "@/dev/scenarios/world/scenario-interest-catalog-data";
import type { Interest } from "@/shared/schemas";

interface ScenarioOnlyInterest extends LeafTag {
  categoryId: string;
  subcategoryId: string;
}

const scenarioOnlyInterests: readonly ScenarioOnlyInterest[] = [
  {
    categoryId: "careers",
    id: "career_growth",
    label: "Career growth",
    subcategoryId: "business",
  },
  {
    categoryId: "lifestyle",
    id: "food_markets",
    label: "Food markets",
    subcategoryId: "food_drink",
  },
];

function buildInterest({
  aliases = [],
  id,
  name,
  parentId,
  sortOrder,
}: {
  aliases?: string[];
  id: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
}): Interest {
  return {
    aliases,
    color: null,
    description: null,
    icon: null,
    id,
    isActive: true,
    name,
    parentId,
    slug: id.replaceAll("_", "-"),
    sortOrder,
  };
}

function buildLeafInterest(
  tag: LeafTag,
  subcategoryId: string,
  sortOrder: number,
) {
  return buildInterest({
    aliases: tag.aliases,
    id: tag.id,
    name: tag.label,
    parentId: subcategoryId,
    sortOrder,
  });
}

function getScenarioOnlyInterests(categoryId: string, subcategoryId: string) {
  return scenarioOnlyInterests.filter(
    (interest) =>
      interest.categoryId === categoryId &&
      interest.subcategoryId === subcategoryId,
  );
}

function buildCategoryInterest(category: Category, sortOrder: number) {
  const categoryInterest = buildInterest({
    id: category.id,
    name: category.label,
    parentId: null,
    sortOrder,
  });

  categoryInterest.children = category.subcategories.map(
    (subcategory, subcategoryIndex) => {
      const subcategoryInterest = buildInterest({
        id: subcategory.id,
        name: subcategory.label,
        parentId: category.id,
        sortOrder: subcategoryIndex,
      });
      const additionalInterests = getScenarioOnlyInterests(
        category.id,
        subcategory.id,
      );

      subcategoryInterest.children = [
        ...subcategory.tags,
        ...additionalInterests,
      ].map((tag, tagIndex) =>
        buildLeafInterest(tag, subcategory.id, tagIndex),
      );

      return subcategoryInterest;
    },
  );

  return categoryInterest;
}

export const scenarioInterestTree = INTEREST_CATEGORIES.map(
  buildCategoryInterest,
);

const scenarioInterestLeaves = scenarioInterestTree.flatMap((category) =>
  (category.children ?? []).flatMap(
    (subcategory) => subcategory.children ?? [],
  ),
);

export const scenarioInterestLeavesById = Object.fromEntries(
  scenarioInterestLeaves.map((interest) => [interest.id, interest]),
) as Record<string, Interest>;

function requireScenarioInterest(id: string) {
  const interest = scenarioInterestLeavesById[id];

  if (!interest) {
    throw new Error(`Scenario interest ${id} is missing from the catalog.`);
  }

  return interest;
}

export const scenarioInterestCatalog = {
  basketball: requireScenarioInterest("basketball"),
  books: requireScenarioInterest("reading"),
  careers: requireScenarioInterest("career_growth"),
  community: requireScenarioInterest("local_community"),
  food: requireScenarioInterest("food_markets"),
  games: requireScenarioInterest("board_games"),
} as const;
