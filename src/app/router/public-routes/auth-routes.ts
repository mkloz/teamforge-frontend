import { createRoute, redirect } from "@tanstack/react-router";
import { createElement } from "react";

import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import {
  ActivateAccountRouteLoading,
  activateAccountPageModule,
  ForgotPasswordRouteLoading,
  forgotPasswordPageModule,
  LoginRouteLoading,
  loginPageModule,
  RegisterRouteLoading,
  ResetPasswordRouteLoading,
  registerPageModule,
  resetPasswordPageModule,
} from "@/app/router/public-routes/lazy-public-route-modules";
import { rootRoute } from "@/app/router/root-route";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { redirectAuthenticatedUser } from "@/app/router/route-guards";
import {
  buildAuthRouteNavigation,
  parseAuthReturnSearch,
} from "@/shared/lib/auth-route";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

export const authRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  beforeLoad: ({ location }) => {
    const { returnTo } = parseAuthReturnSearch(location.searchStr);

    throw redirect(buildAuthRouteNavigation("/auth/login", returnTo));
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  beforeLoad: redirectAuthenticatedUser,
  component: createLazyPageRoute(
    loginPageModule.Component,
    createElement(LoginRouteLoading),
  ),
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
  component: createLazyPageRoute(
    registerPageModule.Component,
    createElement(RegisterRouteLoading),
  ),
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
  component: createLazyPageRoute(
    forgotPasswordPageModule.Component,
    createElement(ForgotPasswordRouteLoading),
  ),
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
  component: createLazyPageRoute(
    resetPasswordPageModule.Component,
    createElement(ResetPasswordRouteLoading),
  ),
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
  component: createLazyPageRoute(
    activateAccountPageModule.Component,
    createElement(ActivateAccountRouteLoading),
  ),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.authActivateAccount,
    fullPage: true,
    title: "We couldn't finish activation",
    description: "The activation flow ran into an unexpected problem.",
    fallbackTo: "/auth/register",
    fallbackLabel: "Back to sign up",
  }),
});

export const authPublicRoutes = [
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  activateAccountRoute,
];
