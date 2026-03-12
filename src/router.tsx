import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AuthPage } from "./features/auth/auth-page";
import { LandingPage } from "./features/landing/landing-page";
import { InterestsPage } from "./features/onboarding/interests-page";
import { PersonalityTestPage } from "./features/onboarding/personality-test-page";
import { AppLayout } from "./features/app-shell/app-layout";

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
  import("./features/explore/explore-page").then((m) => ({ default: m.ExplorePage })),
);
const GroupsPage = lazy(() =>
  import("./features/groups/groups-page").then((m) => ({ default: m.GroupsPage })),
);
const ProfilePage = lazy(() =>
  import("./features/profile/profile-page").then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import("./features/settings/settings-page").then((m) => ({ default: m.SettingsPage })),
);

function LazyPage({ component: Component }: { component: React.ComponentType }) {
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
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
  component: () => <AuthPage defaultView="login" />,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register",
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

const groupsRoute = createRoute({
  getParentRoute: () => appShellRoute,
  path: "/activity",
  component: () => <LazyPage component={GroupsPage} />,
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

// ─── Route tree ───────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  personalityRoute,
  interestsRoute,
  appShellRoute.addChildren([
    homeRoute,
    exploreRoute,
    groupsRoute,
    profileRoute,
    settingsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
});
