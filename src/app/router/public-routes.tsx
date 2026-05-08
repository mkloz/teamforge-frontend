import { createRoute } from "@tanstack/react-router";

import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import { createLazyRouteModule } from "@/app/router/lazy-route-module";
import { rootRoute } from "@/app/router/root-route";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { redirectAuthenticatedUser } from "@/app/router/route-guards";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

const landingPageModule = createLazyRouteModule(() =>
  import("@/features/landing/landing-page").then((m) => ({
    default: m.LandingPage,
  })),
);

const authPageLoader = () => import("@/features/auth/auth-page");

const loginPageModule = createLazyRouteModule(() =>
  authPageLoader().then((m) => ({
    default: () => <m.AuthPage defaultView="login" />,
  })),
);

const registerPageModule = createLazyRouteModule(() =>
  authPageLoader().then((m) => ({
    default: () => <m.AuthPage defaultView="register" />,
  })),
);

const forgotPasswordPageModule = createLazyRouteModule(() =>
  import("@/features/auth/forgot-password-page").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);

const resetPasswordPageModule = createLazyRouteModule(() =>
  import("@/features/auth/reset-password-page").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

const activateAccountPageModule = createLazyRouteModule(() =>
  import("@/features/auth/activate-account-page").then((m) => ({
    default: m.ActivateAccountPage,
  })),
);

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: createLazyPageRoute(landingPageModule.Component),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  beforeLoad: redirectAuthenticatedUser,
  component: createLazyPageRoute(loginPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.authLogin,
    fullPage: true,
    title: "We hit a sign-in problem",
    description: "TeamForge couldn't finish loading the login flow right now.",
    fallbackTo: "/",
    fallbackLabel: "Back home",
  }),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/register",
  beforeLoad: redirectAuthenticatedUser,
  component: createLazyPageRoute(registerPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.authRegister,
    fullPage: true,
    title: "We hit a sign-up problem",
    description: "TeamForge couldn't finish loading registration right now.",
    fallbackTo: "/",
    fallbackLabel: "Back home",
  }),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/forgot-password",
  beforeLoad: redirectAuthenticatedUser,
  component: createLazyPageRoute(forgotPasswordPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.authForgotPassword,
    fullPage: true,
    title: "We hit a recovery problem",
    description: "The password reset screen couldn't finish loading right now.",
    fallbackTo: "/auth/login",
    fallbackLabel: "Back to login",
  }),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/reset-password/$token",
  component: createLazyPageRoute(resetPasswordPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.authResetPassword,
    fullPage: true,
    title: "We couldn't open this reset flow",
    description: "The password reset experience hit an unexpected issue.",
    fallbackTo: "/auth/login",
    fallbackLabel: "Back to login",
  }),
});

const activateAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/activate/$token",
  component: createLazyPageRoute(activateAccountPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.authActivateAccount,
    fullPage: true,
    title: "We couldn't finish activation",
    description: "The activation flow ran into an unexpected problem.",
    fallbackTo: "/auth/register",
    fallbackLabel: "Back to sign up",
  }),
});

export const publicRoutes = [
  landingRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  activateAccountRoute,
];

export const publicRouteModules = [
  landingPageModule,
  loginPageModule,
  registerPageModule,
  forgotPasswordPageModule,
  resetPasswordPageModule,
  activateAccountPageModule,
];
