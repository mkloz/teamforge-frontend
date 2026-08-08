import type { OnboardingProductState } from "@/shared/schemas/onboarding-product-state";

export type NavigationTourPageId =
  OnboardingProductState["presentation"]["coachmarkOrder"][number];

export type NavigationTourPath = "/explore" | "/forge" | "/activity";

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
    START_FORGE: { allowed: boolean };
    START_INTRODUCTORY_FORGE: { allowed: boolean };
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
  FORGE: {
    action: "Choose Start when you have an activity in mind.",
    body: "When nothing fits, start your own plan. Set the activity and group shape; TeamForge helps bring compatible people together.",
    id: "forge-start",
    pageId: "FORGE",
    pageLabel: "Forge",
    pathname: "/forge",
    targetSelector: "[data-onboarding-tour='forge-start']",
    title: "Turn an idea into a group",
  },
  ACTIVITY: {
    action: "Open the item with an unread badge or pending decision.",
    body: "Invites, conversations, plan changes, and matching progress stay together here so you can respond without losing context.",
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
  "FORGE",
  "ACTIVITY",
];

export function buildNavigationTourSteps(
  productState: NavigationTourProductState | undefined,
): NavigationTourStep[] {
  if (!productState) return [];

  const canOpenForge = [
    productState.capabilities.START_FORGE,
    productState.capabilities.START_INTRODUCTORY_FORGE,
  ].some((decision) => decision.allowed);
  const pageOrder = uniquePageIds([
    ...productState.presentation.coachmarkOrder,
    ...FALLBACK_PRODUCT_ORDER,
  ]).filter((pageId) => pageId !== "FORGE" || canOpenForge);

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
