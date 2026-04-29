/* eslint-disable react-refresh/only-export-components */
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AppLayout } from "./features/app-shell/app-layout";
import { AuthQueries } from "./features/auth/api/auth.queries";
import { AuthPage } from "./features/auth/auth-page";
import { LandingPage } from "./features/landing/landing-page";
import { InterestsPage } from "./features/onboarding/interests-page";
import { PersonalityTestPage } from "./features/onboarding/personality-test-page";
import { authSession } from "./shared/api/auth-session";

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
const DesignSystemPage = lazy(() =>
  import("./features/design-system/design-system-page").then((m) => ({
    default: m.DesignSystemPage,
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

async function redirectAuthenticatedUser() {
  if (!authSession.hasTokens()) {
    return;
  }

  const currentUser = await AuthQueries.ensureCurrentUser().catch(() => null);

  if (!currentUser) {
    return;
  }

  throw redirect({ to: "/home" });
}

// ─── Root route ──────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => <Outlet />,
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
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register",
  beforeLoad: redirectAuthenticatedUser,
  component: () => <AuthPage defaultView="register" />,
});

const personalityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/personality",
  component: PersonalityTestPage,
});

const interestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding/interests",
  component: InterestsPage,
});

// ─── App shell layout route (authenticated) ───────────────────────────────────

const appShellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-shell",
  beforeLoad: async () => {
    if (!authSession.hasTokens()) {
      throw redirect({ to: "/auth/login" });
    }

    try {
      await AuthQueries.ensureCurrentUser();
    } catch {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: AppLayout,
});

// ─── App page routes (children of app shell) ─────────────────────────────────

const homeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/home",
  component: () => <LazyPage component={HomePage} />,
});

const exploreRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/explore",
  component: () => <LazyPage component={ExplorePage} />,
});

const activityRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/activity",
  component: () => <LazyPage component={ActivityPage} />,
});

const profileRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/profile",
  component: () => <LazyPage component={ProfilePage} />,
});

const settingsRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/settings",
  component: () => <LazyPage component={SettingsPage} />,
});

const forgeRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/forge",
  component: () => <LazyPage component={ForgePage} />,
});

const designSystemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system",
  component: () => <LazyPage component={DesignSystemPage} />,
});

// ─── Route tree ───────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  personalityRoute,
  interestsRoute,
  designSystemRoute,
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
