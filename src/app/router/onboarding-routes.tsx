import { createRoute } from "@tanstack/react-router";

import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import { createLazyRouteLoading } from "@/app/router/lazy-route-loading";
import {
  createLazyRouteModule,
  type LazyRouteModule,
} from "@/app/router/lazy-route-module";
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

const ProfileBasicsRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/onboarding/onboarding-page.loading").then((m) => ({
      default: m.OnboardingPageLoading,
    })),
  { mode: "route", step: "profile" },
);

const personalityTestPageModule = createLazyRouteModule(() =>
  import("@/features/onboarding/personality-test-page").then((m) => ({
    default: m.PersonalityTestPage,
  })),
);

const PersonalityRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/onboarding/onboarding-page.loading").then((m) => ({
      default: m.OnboardingPageLoading,
    })),
  { mode: "route", step: "personality" },
);

const interestsPageModule = createLazyRouteModule(() =>
  import("@/features/onboarding/interests-page").then((m) => ({
    default: m.InterestsPage,
  })),
);

const InterestsRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/onboarding/onboarding-page.loading").then((m) => ({
      default: m.OnboardingPageLoading,
    })),
  { mode: "route", step: "interests" },
);

async function preloadPageWhileGuardRuns<T>(
  guardTask: Promise<T>,
  pageModule: LazyRouteModule,
) {
  const [guardResult] = await Promise.all([guardTask, pageModule.preload()]);

  return guardResult;
}

const profileBasicsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/profile",
  beforeLoad: ({ location }) =>
    preloadPageWhileGuardRuns(
      requireCanonicalOnboardingRoute(location, "/onboarding/profile"),
      profileBasicsPageModule,
    ),
  pendingComponent: ProfileBasicsRouteLoading,
  component: createLazyPageRoute(
    profileBasicsPageModule.Component,
    <ProfileBasicsRouteLoading />,
  ),
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
    preloadPageWhileGuardRuns(
      requireEditableOnboardingRoute(location, "/onboarding/personality"),
      personalityTestPageModule,
    ),
  pendingComponent: PersonalityRouteLoading,
  component: createLazyPageRoute(
    personalityTestPageModule.Component,
    <PersonalityRouteLoading />,
  ),
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
    preloadPageWhileGuardRuns(
      requireEditableOnboardingRoute(location, "/onboarding/interests"),
      interestsPageModule,
    ),
  pendingComponent: InterestsRouteLoading,
  component: createLazyPageRoute(
    interestsPageModule.Component,
    <InterestsRouteLoading />,
  ),
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
