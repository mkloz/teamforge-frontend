import type { OnboardingProductState } from "@/shared/schemas/onboarding-product-state";

export type NavigationTourPageId =
  OnboardingProductState["presentation"]["coachmarkOrder"][number];

export type NavigationTourPath = "/explore" | "/plans/new" | "/activity";

export interface NavigationTourStep {
  action: string;
  body: string;
  id: string;
  pageId: NavigationTourPageId;
  pageLabel: string;
  pathname: NavigationTourPath;
  targetSelector: string;
  title: string;
}

interface NavigationTourProductState {
  capabilities: {
    START_GROUP_FORMATION: { allowed: boolean };
    START_INTRODUCTORY_GROUP_FORMATION: { allowed: boolean };
  };
  presentation: {
    coachmarkOrder: OnboardingProductState["presentation"]["coachmarkOrder"];
  };
}

const TOUR_STEPS: Record<NavigationTourPageId, NavigationTourStep> = {
  EXPLORE: {
    action: "Use Filters, then open one plan to check the details.",
    body: "Search and filters narrow the open plans. Before joining, you can check the activity, time, place, and group fit.",
    id: "explore-discovery",
    pageId: "EXPLORE",
    pageLabel: "Explore",
    pathname: "/explore",
    targetSelector: "[data-onboarding-tour='explore-discovery']",
    title: "Find a plan that fits",
  },
  START_PLAN: {
    action: "Choose Start when you have an activity in mind.",
    body: "When nothing fits, start your own plan. Set the activity and group shape; Findafew helps bring compatible people together.",
    id: "plan-creation-start",
    pageId: "START_PLAN",
    pageLabel: "Start a plan",
    pathname: "/plans/new",
    targetSelector: "[data-onboarding-tour='plan-creation-start']",
    title: "Turn an idea into a group",
  },
  ACTIVITY: {
    action: "Open the item with an unread badge or pending decision.",
    body: "Invites, conversations, plan changes, and group proposal updates stay together here so you can respond without losing context.",
    id: "activity-workspace",
    pageId: "ACTIVITY",
    pageLabel: "Activity",
    pathname: "/activity",
    targetSelector: "[data-onboarding-tour='activity-workspace']",
    title: "Keep the plan moving",
  },
};

const FALLBACK_PRODUCT_ORDER: NavigationTourPageId[] = [
  "EXPLORE",
  "START_PLAN",
  "ACTIVITY",
];

export function buildNavigationTourSteps(
  productState: NavigationTourProductState | undefined,
): NavigationTourStep[] {
  if (!productState) return [];

  const canStartPlan = [
    productState.capabilities.START_GROUP_FORMATION,
    productState.capabilities.START_INTRODUCTORY_GROUP_FORMATION,
  ].some((decision) => decision.allowed);
  const pageOrder = uniquePageIds([
    ...productState.presentation.coachmarkOrder,
    ...FALLBACK_PRODUCT_ORDER,
  ]).filter((pageId) => pageId !== "START_PLAN" || canStartPlan);

  return pageOrder.map((pageId) => TOUR_STEPS[pageId]);
}

export function isNavigationTourPathActive(
  pathname: string,
  expectedPathname: NavigationTourPath,
) {
  return (
    pathname === expectedPathname || pathname.startsWith(`${expectedPathname}/`)
  );
}

function uniquePageIds(pageIds: NavigationTourPageId[]) {
  return [...new Set(pageIds)];
}
