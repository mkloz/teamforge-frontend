import type { OnboardingProductState } from "@/shared/schemas/onboarding-product-state";

export type NavigationTourPageId =
  | "HOME"
  | "EXPLORE"
  | "FORGE"
  | "ACTIVITY"
  | "PROFILE";

export type NavigationTourPath =
  | "/home"
  | "/explore"
  | "/forge"
  | "/activity"
  | "/profile";

export interface NavigationTourStep {
  body: string;
  id: string;
  pageId: NavigationTourPageId;
  pageLabel: string;
  pathname: NavigationTourPath;
  targetSelector: string;
  title: string;
}

interface NavigationTourPage {
  id: NavigationTourPageId;
  label: string;
  pathname: NavigationTourPath;
  purpose: Omit<NavigationTourStep, "id" | "pageId" | "pageLabel" | "pathname">;
  navigation: Omit<
    NavigationTourStep,
    "id" | "pageId" | "pageLabel" | "pathname"
  >;
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

const TOUR_PAGES: Record<NavigationTourPageId, NavigationTourPage> = {
  HOME: {
    id: "HOME",
    label: "Home",
    pathname: "/home",
    purpose: {
      targetSelector: "[data-onboarding-tour='home-overview']",
      title: "See what needs you now",
      body: "Home brings together invitations, upcoming plans, active searches, and the next account task that matters.",
    },
    navigation: {
      targetSelector: "[data-onboarding-tour='nav-home']",
      title: "Return to Home",
      body: "Use Home whenever you want a clear overview of current plans and actions waiting for you.",
    },
  },
  EXPLORE: {
    id: "EXPLORE",
    label: "Explore",
    pathname: "/explore",
    purpose: {
      targetSelector: "[data-onboarding-tour='explore-discovery']",
      title: "Find plans without committing",
      body: "Explore shows open plans you can search and filter. Opening a plan lets you understand it before you decide whether to take part.",
    },
    navigation: {
      targetSelector: "[data-onboarding-tour='nav-explore']",
      title: "Open Explore",
      body: "Use Explore when you want to discover something new or return to an opening you were considering.",
    },
  },
  FORGE: {
    id: "FORGE",
    label: "Forge",
    pathname: "/forge",
    purpose: {
      targetSelector: "[data-onboarding-tour='forge-start']",
      title: "Start with one real plan",
      body: "Forge turns an activity idea into a real group plan. You choose what should happen; TeamForge helps find compatible people.",
    },
    navigation: {
      targetSelector: "[data-onboarding-tour='nav-forge']",
      title: "Bring a plan to Forge",
      body: "Use Forge when you know what you want to do and want TeamForge to help assemble the group.",
    },
  },
  ACTIVITY: {
    id: "ACTIVITY",
    label: "Activity",
    pathname: "/activity",
    purpose: {
      targetSelector: "[data-onboarding-tour='activity-workspace']",
      title: "Follow real progress",
      body: "Activity keeps group conversations, invitations, plan changes, and search progress together so you can respond in context.",
    },
    navigation: {
      targetSelector: "[data-onboarding-tour='nav-activity']",
      title: "Check Activity",
      body: "Use Activity when a plan moves forward, someone messages you, or TeamForge needs a decision from you.",
    },
  },
  PROFILE: {
    id: "PROFILE",
    label: "Profile",
    pathname: "/profile",
    purpose: {
      targetSelector: "[data-onboarding-tour='profile-overview']",
      title: "Review how you appear to people",
      body: "Profile shows the introduction, interests, and matching information other people can use when considering a plan with you.",
    },
    navigation: {
      targetSelector: "[data-onboarding-tour='nav-profile']",
      title: "Open your Profile",
      body: "Use Profile to review your public information and see how your TeamForge history develops over time.",
    },
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
  const intentOrder: NavigationTourPageId[] = [
    ...productState.presentation.coachmarkOrder,
  ];
  const pageOrder = uniquePageIds([
    ...intentOrder,
    ...FALLBACK_PRODUCT_ORDER,
    "HOME",
    "PROFILE",
  ]).filter((pageId) => pageId !== "FORGE" || canOpenForge);

  return pageOrder.flatMap((page) => buildPageSteps(TOUR_PAGES[page]));
}

export function isNavigationTourPathActive(
  pathname: string,
  expectedPathname: NavigationTourPath,
) {
  return (
    pathname === expectedPathname || pathname.startsWith(`${expectedPathname}/`)
  );
}

function buildPageSteps(page: NavigationTourPage): NavigationTourStep[] {
  return [
    {
      ...page.purpose,
      id: `${page.id.toLowerCase()}-purpose`,
      pageId: page.id,
      pageLabel: page.label,
      pathname: page.pathname,
    },
    {
      ...page.navigation,
      id: `${page.id.toLowerCase()}-navigation`,
      pageId: page.id,
      pageLabel: page.label,
      pathname: page.pathname,
    },
  ];
}

function uniquePageIds(pageIds: NavigationTourPageId[]) {
  return [...new Set(pageIds)];
}
