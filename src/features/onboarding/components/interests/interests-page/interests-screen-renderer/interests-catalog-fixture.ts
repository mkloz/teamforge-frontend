import { buildLeafInterestMap } from "@/features/onboarding/lib/interest-catalog";
import type { Interest } from "@/shared/schemas";

export const interestsCatalogFixtureCategories = buildFixtureInterestTree();
export const interestsCatalogFixtureLeafById = buildLeafInterestMap(
  interestsCatalogFixtureCategories,
);
export const interestsCatalogFixtureSelectedIds = new Set([
  "indie-films",
  "board-games",
  "coffee-shops",
]);
export const interestsCatalogFixtureExpandedSubcategories = new Set([
  "creative-media",
  "social-spaces",
]);

export const interestsCatalogFixtureSuggestedTags = [
  interestsCatalogFixtureLeafById["live-music"],
  interestsCatalogFixtureLeafById["street-food"],
  interestsCatalogFixtureLeafById["gallery-nights"],
].filter((item): item is Interest => Boolean(item));

export const interestsCatalogFixtureRelatedTags = [
  interestsCatalogFixtureLeafById["book-clubs"],
  interestsCatalogFixtureLeafById["maker-spaces"],
  interestsCatalogFixtureLeafById["city-walks"],
].filter((item): item is Interest => Boolean(item));

function buildFixtureInterestTree(): Interest[] {
  return [
    category("creative", "Creative", [
      subcategory("creative-media", "Media", [
        leaf("indie-films", "Indie films"),
        leaf("live-music", "Live music"),
        leaf("gallery-nights", "Gallery nights"),
      ]),
      subcategory("creative-making", "Making", [
        leaf("maker-spaces", "Maker spaces"),
        leaf("writing", "Writing"),
      ]),
    ]),
    category("social", "Social", [
      subcategory("social-spaces", "Gathering spots", [
        leaf("coffee-shops", "Coffee shops"),
        leaf("street-food", "Street food"),
        leaf("book-clubs", "Book clubs"),
      ]),
      subcategory("social-games", "Games", [
        leaf("board-games", "Board games"),
        leaf("trivia", "Trivia"),
      ]),
    ]),
    category("outdoors", "Outdoors", [
      subcategory("outdoors-local", "Local exploring", [
        leaf("city-walks", "City walks"),
        leaf("parks", "Parks"),
      ]),
    ]),
  ];
}

function category(id: string, name: string, children: Interest[]): Interest {
  return buildInterest(id, name, null, children);
}

function subcategory(id: string, name: string, children: Interest[]): Interest {
  return buildInterest(id, name, null, children);
}

function leaf(id: string, name: string): Interest {
  return buildInterest(id, name, null, []);
}

function buildInterest(
  id: string,
  name: string,
  parentId: string | null,
  children: Interest[],
): Interest {
  return {
    id,
    name,
    slug: id,
    description: null,
    icon: null,
    color: null,
    sortOrder: 0,
    isActive: true,
    parentId,
    aliases: [],
    children,
  };
}
