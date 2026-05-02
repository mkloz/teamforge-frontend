import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";

import { LazyPage } from "@/app/router/lazy-page";
import { rootRoute } from "@/app/router/root-route";
import {
  requireCanonicalOnboardingRoute,
  requireEditableOnboardingRoute,
} from "@/app/router/route-guards";
import { RouteErrorState } from "@/shared/components/route-error-state";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

const ProfileBasicsPage = lazy(() =>
  import("@/features/onboarding/profile-basics-page").then((m) => ({
    default: m.ProfileBasicsPage,
  })),
);

const PersonalityTestPage = lazy(() =>
  import("@/features/onboarding/personality-test-page").then((m) => ({
    default: m.PersonalityTestPage,
  })),
);

const InterestsPage = lazy(() =>
  import("@/features/onboarding/interests-page").then((m) => ({
    default: m.InterestsPage,
  })),
);

const profileBasicsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/profile",
  beforeLoad: ({ location }) =>
    requireCanonicalOnboardingRoute(location, "/onboarding/profile"),
  component: () => <LazyPage component={ProfileBasicsPage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.onboardingProfile}
      fullPage
      title="We couldn't load your profile step"
      description="The profile basics step hit an unexpected issue before it could settle."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const personalityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/personality",
  beforeLoad: ({ location }) =>
    requireEditableOnboardingRoute(location, "/onboarding/personality"),
  component: () => <LazyPage component={PersonalityTestPage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.onboardingPersonality}
      fullPage
      title="We couldn't load the personality step"
      description="The personality questionnaire hit an unexpected issue before it could settle."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const interestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/interests",
  beforeLoad: ({ location }) =>
    requireEditableOnboardingRoute(location, "/onboarding/interests"),
  component: () => <LazyPage component={InterestsPage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.onboardingInterests}
      fullPage
      title="We couldn't load your interests"
      description="The interests step ran into an unexpected issue while preparing your options."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

export const onboardingRoutes = [
  profileBasicsRoute,
  personalityRoute,
  interestsRoute,
];
