import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { AuthPage } from "./features/auth/auth-page";
import { LandingPage } from "./features/landing/landing-page";
import { PersonalityTestPage } from "./features/onboarding/personality-test-page";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

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

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  personalityRoute,
]);

export const router = createRouter({
  routeTree,
});
