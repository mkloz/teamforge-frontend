import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";

import { TemplateSuggestionCard } from "./template-suggestion-card";
import type { TemplateSuggestionCardProps } from "./types";

export const TEMPLATE_SUGGESTIONS_SKELETON_NAME = "forge.template-suggestions";

const templateSuggestionsFixture = [
  {
    id: "fixture-arts-film",
    categoryId: "ARTS",
    categoryLabel: "Arts & Culture",
    title: "Indie screening",
    description: "A small cinema plan with a relaxed debrief after.",
    badge: "Personal fit",
    score: 8.2,
    template: {
      selectedActivity: "Arts & Culture",
      planName: "Indie screening",
      planDescription: "Watch something thoughtful and talk it through after.",
      planLocation: "",
      planLocationLat: null,
      planLocationLng: null,
      locationType: "IN_PERSON",
      planCost: "PAID",
      planCostAmount: "",
      planCostDetails: "",
      forgeMode: "AUTO",
      fixedSize: 5,
      visibility: "PUBLIC",
      groupName: "Indie Film Circle",
      groupDescription: "A thoughtful small cinema group.",
      coverImage: null,
      avatarImage: null,
    },
  },
  {
    id: "fixture-tech-demo",
    categoryId: "TECH",
    categoryLabel: "Tech & Build",
    title: "Product teardown",
    description: "Bring one thing and get clear, practical feedback.",
    badge: "Recommended",
    score: 7.4,
    template: {
      selectedActivity: "Tech & Build",
      planName: "Product teardown",
      planDescription: "Bring one thing and get clear, practical feedback.",
      planLocation: "",
      planLocationLat: null,
      planLocationLng: null,
      locationType: "ONLINE",
      planCost: "FREE",
      planCostAmount: "",
      planCostDetails: "",
      forgeMode: "AUTO",
      fixedSize: 4,
      visibility: "PUBLIC",
      groupName: "Product Teardown Circle",
      groupDescription: "A useful feedback group for builders.",
      coverImage: null,
      avatarImage: null,
    },
  },
  {
    id: "fixture-sports-climb",
    categoryId: "SPORTS",
    categoryLabel: "Sport & Movement",
    title: "Bouldering session",
    description: "A low-pressure climb with coffee after.",
    badge: "Flexible",
    score: 6.8,
    template: {
      selectedActivity: "Sport & Movement",
      planName: "Bouldering session",
      planDescription: "A low-pressure climb with coffee after.",
      planLocation: "",
      planLocationLat: null,
      planLocationLng: null,
      locationType: "IN_PERSON",
      planCost: "PAID",
      planCostAmount: "",
      planCostDetails: "",
      forgeMode: "AUTO",
      fixedSize: 4,
      visibility: "PUBLIC",
      groupName: "Sunday Bouldering",
      groupDescription: "Climb first, coffee after.",
      coverImage: null,
      avatarImage: null,
    },
  },
  {
    id: "fixture-food-market",
    categoryId: "FOOD",
    categoryLabel: "Food & Drink",
    title: "Market lunch",
    description: "Pick a few stalls and keep the group easygoing.",
    badge: "Flexible",
    score: 6.1,
    template: {
      selectedActivity: "Food & Drink",
      planName: "Market lunch",
      planDescription: "Pick a few stalls and keep the group easygoing.",
      planLocation: "",
      planLocationLat: null,
      planLocationLng: null,
      locationType: "IN_PERSON",
      planCost: "PAID",
      planCostAmount: "",
      planCostDetails: "",
      forgeMode: "AUTO",
      fixedSize: 6,
      visibility: "PUBLIC",
      groupName: "Market Lunch Crew",
      groupDescription: "A relaxed food plan for trying a few spots.",
      coverImage: null,
      avatarImage: null,
    },
  },
] satisfies TemplateSuggestionCardProps["suggestion"][];

const noop: TemplateSuggestionCardProps["onTemplateToggle"] = () => undefined;

export function TemplateSuggestionsSkeleton() {
  return (
    <GeneratedSkeleton
      name={TEMPLATE_SUGGESTIONS_SKELETON_NAME}
      loading
      fixture={<TemplateSuggestionsSkeletonFixture />}
    >
      <TemplateSuggestionsSkeletonFixture />
    </GeneratedSkeleton>
  );
}

export function TemplateSuggestionsSkeletonFixture() {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {templateSuggestionsFixture.map((suggestion) => (
        <TemplateSuggestionCard
          key={suggestion.id}
          active={suggestion.badge === "Personal fit"}
          onTemplateToggle={noop}
          suggestion={suggestion}
        />
      ))}
    </div>
  );
}
