/* eslint-disable react-refresh/only-export-components */
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { lazy, Suspense } from "react";
import { AppLayout } from "./features/app-shell/app-layout";
import { AuthQueries } from "./features/auth/api/auth.queries";
import { ActivateAccountPage } from "./features/auth/activate-account-page";
import { AuthPage } from "./features/auth/auth-page";
import {
  buildAuthRouteNavigation,
  buildPostAuthRedirectNavigation,
  buildRouteLocationHref,
  parseAuthReturnSearch,
} from "./features/auth/lib/auth-return";
import { getPostAuthRedirectPath } from "./features/auth/lib/post-auth-route";
import { ForgotPasswordPage } from "./features/auth/forgot-password-page";
import { ResetPasswordPage } from "./features/auth/reset-password-page";
import { LandingPage } from "./features/landing/landing-page";
import { parseOnboardingFlowSearch } from "./features/onboarding/lib/onboarding-flow-state";
import { InterestsPage } from "./features/onboarding/interests-page";
import { PersonalityTestPage } from "./features/onboarding/personality-test-page";
import { ProfileBasicsPage } from "./features/onboarding/profile-basics-page";
import { authSession } from "./shared/api/auth-session";
import { NotFoundState } from "./shared/components/not-found-state";
import { RouteErrorState } from "./shared/components/route-error-state";
import { routeErrorScopes } from "./shared/lib/telemetry-contract";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Lazy-load all app pages for optimal initial bundle size
const HomePage = lazy(() =>
  import("./features/home/home-page").then((m) => ({ default: m.HomePage })),
);
const ExplorePage = lazy(() =>
  import("./features/explore/explore-page").then((m) => ({
    default: m.ExplorePage,
  })),
);
const ActivityPage = lazy(() =>
  import("./features/activity/activity-page").then((m) => ({
    default: m.ActivityPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./features/profile/profile-page").then((m) => ({
    default: m.ProfilePage,
  })),
);
const SettingsPage = lazy(() =>
  import("./features/settings/settings-page").then((m) => ({
    default: m.SettingsPage,
  })),
);
const ForgePage = lazy(() =>
  import("./features/forge/forge-page").then((m) => ({
    default: m.ForgePage,
  })),
);
function LazyPage({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}

async function redirectAuthenticatedUser({
  location,
}: {
  location: { searchStr: string };
}) {
  if (!authSession.hasTokens()) {
    return;
  }

  const currentUser = await AuthQueries.ensureCurrentUser().catch(() => null);

  if (!currentUser) {
    return;
  }

  const { returnTo } = parseAuthReturnSearch(location.searchStr);

  throw redirect(buildPostAuthRedirectNavigation(currentUser, returnTo));
}

async function requireAuthenticatedUser(location?: {
  pathname: string;
  searchStr: string;
}) {
  const returnHref = buildRouteLocationHref(location);

  if (!authSession.hasTokens()) {
    throw redirect(buildAuthRouteNavigation("/auth/login", returnHref));
  }

  try {
    const currentUser = await AuthQueries.ensureCurrentUser();

    if (!currentUser) {
      throw redirect(buildAuthRouteNavigation("/auth/login", returnHref));
    }

    return currentUser;
  } catch {
    throw redirect(buildAuthRouteNavigation("/auth/login", returnHref));
  }
}

// ─── Root route ──────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  ),
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.root}
      fullPage
      title="Something went wrong in TeamForge"
      description="The app hit an unexpected issue while loading this screen."
      fallbackTo="/"
      fallbackLabel="Back home"
      onRetry={reset}
    />
  ),
  notFoundComponent: () => <NotFoundState fullPage />,
});

// ─── Public routes (no app shell) ────────────────────────────────────────────

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  beforeLoad: redirectAuthenticatedUser,
  component: () => <AuthPage defaultView="login" />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.authLogin}
      fullPage
      title="We hit a sign-in problem"
      description="TeamForge couldn't finish loading the login flow right now."
      fallbackTo="/"
      fallbackLabel="Back home"
      onRetry={reset}
    />
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register",
  beforeLoad: redirectAuthenticatedUser,
  component: () => <AuthPage defaultView="register" />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.authRegister}
      fullPage
      title="We hit a sign-up problem"
      description="TeamForge couldn't finish loading registration right now."
      fallbackTo="/"
      fallbackLabel="Back home"
      onRetry={reset}
    />
  ),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/forgot-password",
  beforeLoad: redirectAuthenticatedUser,
  component: ForgotPasswordPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.authForgotPassword}
      fullPage
      title="We hit a recovery problem"
      description="The password reset screen couldn't finish loading right now."
      fallbackTo="/auth/login"
      fallbackLabel="Back to login"
      onRetry={reset}
    />
  ),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/reset-password/$token",
  component: ResetPasswordPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.authResetPassword}
      fullPage
      title="We couldn't open this reset flow"
      description="The password reset experience hit an unexpected issue."
      fallbackTo="/auth/login"
      fallbackLabel="Back to login"
      onRetry={reset}
    />
  ),
});

const activateAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/activate/$token",
  component: ActivateAccountPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.authActivateAccount}
      fullPage
      title="We couldn't finish activation"
      description="The activation flow ran into an unexpected problem."
      fallbackTo="/auth/register"
      fallbackLabel="Back to sign up"
      onRetry={reset}
    />
  ),
});

const profileBasicsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/profile",
  beforeLoad: async ({ location }) => {
    const currentUser = await requireAuthenticatedUser(location);
    const canonicalDestination = getPostAuthRedirectPath(currentUser);

    if (canonicalDestination !== "/onboarding/profile") {
      throw redirect({ to: canonicalDestination });
    }
  },
  component: ProfileBasicsPage,
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
  beforeLoad: async ({ location }) => {
    const currentUser = await requireAuthenticatedUser(location);
    const { isEditMode } = parseOnboardingFlowSearch(location.searchStr);
    const canonicalDestination = getPostAuthRedirectPath(currentUser);

    if (isEditMode) {
      if (canonicalDestination !== "/home") {
        throw redirect({ to: canonicalDestination });
      }

      return;
    }

    if (canonicalDestination !== "/onboarding/personality") {
      throw redirect({ to: canonicalDestination });
    }
  },
  component: PersonalityTestPage,
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
  beforeLoad: async ({ location }) => {
    const currentUser = await requireAuthenticatedUser(location);
    const { isEditMode } = parseOnboardingFlowSearch(location.searchStr);
    const canonicalDestination = getPostAuthRedirectPath(currentUser);

    if (isEditMode) {
      if (canonicalDestination !== "/home") {
        throw redirect({ to: canonicalDestination });
      }

      return;
    }

    if (canonicalDestination !== "/onboarding/interests") {
      throw redirect({ to: canonicalDestination });
    }
  },
  component: InterestsPage,
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

// ─── App shell layout route (authenticated) ───────────────────────────────────

const appShellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-shell",
  beforeLoad: async ({ location }) => {
    const currentUser = await requireAuthenticatedUser(location);
    const canonicalDestination = getPostAuthRedirectPath(currentUser);

    if (canonicalDestination !== "/home") {
      throw redirect({ to: canonicalDestination });
    }
  },
  component: AppLayout,
});

// ─── App page routes (children of app shell) ─────────────────────────────────

const homeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/home",
  component: () => <LazyPage component={HomePage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.home}
      title="Home could not finish loading"
      description="Your dashboard hit an unexpected issue while refreshing groups, plans, or recommendations."
      fallbackTo="/activity"
      fallbackLabel="Open activity"
      onRetry={reset}
    />
  ),
});

const exploreRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/explore",
  component: () => <LazyPage component={ExplorePage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.explore}
      title="Explore could not finish loading"
      description="Group discovery ran into an unexpected issue while loading people, requests, or group options."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const activityRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/activity",
  component: () => <LazyPage component={ActivityPage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.activity}
      title="The activity workspace hit a snag"
      description="Your conversations and planning space couldn't finish rendering cleanly."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/profile",
  component: () => <LazyPage component={ProfilePage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.profile}
      title="Profile could not finish loading"
      description="Your profile hit an unexpected issue while loading personality details, interests, or trust history."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/settings",
  component: () => <LazyPage component={SettingsPage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.settings}
      title="Settings could not finish loading"
      description="Your account settings hit an unexpected issue before the page could render cleanly."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const forgeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/forge",
  component: () => <LazyPage component={ForgePage} />,
  errorComponent: ({ error, reset }) => (
    <RouteErrorState
      error={error}
      scope={routeErrorScopes.forge}
      title="Forge hit an unexpected issue"
      description="We couldn't finish loading the group-forging flow right now."
      fallbackTo="/home"
      fallbackLabel="Back to home"
      onRetry={reset}
    />
  ),
});

const designSystemRoute = (() => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const DesignSystemPage = lazy(() =>
    import("./features/design-system/design-system-page").then((m) => ({
      default: m.DesignSystemPage,
    })),
  );

  return createRoute({
    getParentRoute: () => rootRoute,
    path: "/design-system",
    component: () => <LazyPage component={DesignSystemPage} />,
    errorComponent: ({ error, reset }) => (
      <RouteErrorState
        error={error}
        scope={routeErrorScopes.designSystem}
        fullPage
        title="Design system could not finish loading"
        description="The internal visual QA surface hit an unexpected issue while loading components or examples."
        fallbackTo="/home"
        fallbackLabel="Back to home"
        onRetry={reset}
      />
    ),
  });
})();

// ─── Route tree ───────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  activateAccountRoute,
  profileBasicsRoute,
  personalityRoute,
  interestsRoute,
  ...(designSystemRoute ? [designSystemRoute] : []),
  appShellRoute.addChildren([
    homeRoute,
    exploreRoute,
    activityRoute,
    profileRoute,
    settingsRoute,
    forgeRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});
