import { createRoute } from "@tanstack/react-router";

import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import { createLazyRouteModule } from "@/app/router/lazy-route-module";
import { rootRoute } from "@/app/router/root-route";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import {
  requireCanonicalOnboardingRoute,
  requireEditableOnboardingRoute,
} from "@/app/router/route-guards";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

const profileBasicsPageModule = createLazyRouteModule(() =>
  import("@/features/onboarding/profile-basics-page").then((m) => ({
    default: m.ProfileBasicsPage,
  })),
);

const personalityTestPageModule = createLazyRouteModule(() =>
  import("@/features/onboarding/personality-test-page").then((m) => ({
    default: m.PersonalityTestPage,
  })),
);

const interestsPageModule = createLazyRouteModule(() =>
  import("@/features/onboarding/interests-page").then((m) => ({
    default: m.InterestsPage,
  })),
);

const profileBasicsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/profile",
  beforeLoad: ({ location }) =>
    requireCanonicalOnboardingRoute(location, "/onboarding/profile"),
  component: createLazyPageRoute(profileBasicsPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.onboardingProfile,
    fullPage: true,
    title: "We couldn't load your profile step",
    description:
      "The profile basics step hit an unexpected issue before it could settle.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
});

const personalityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/personality",
  beforeLoad: ({ location }) =>
    requireEditableOnboardingRoute(location, "/onboarding/personality"),
  component: createLazyPageRoute(personalityTestPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.onboardingPersonality,
    fullPage: true,
    title: "We couldn't load the personality step",
    description:
      "The personality questionnaire hit an unexpected issue before it could settle.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
});

const interestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/interests",
  beforeLoad: ({ location }) =>
    requireEditableOnboardingRoute(location, "/onboarding/interests"),
  component: createLazyPageRoute(interestsPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.onboardingInterests,
    fullPage: true,
    title: "We couldn't load your interests",
    description:
      "The interests step ran into an unexpected issue while preparing your options.",
    fallbackTo: "/home",
    fallbackLabel: "Back to home",
  }),
});

export const onboardingRoutes = [
  profileBasicsRoute,
  personalityRoute,
  interestsRoute,
];

export const onboardingRouteModules = [
  profileBasicsPageModule,
  personalityTestPageModule,
  interestsPageModule,
];
