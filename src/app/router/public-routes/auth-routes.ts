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
    title: "Sign-in page could not load",
    description: "Try again or return to the homepage.",
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
    title: "Sign-up page could not load",
    description: "Try again or return to the homepage.",
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
    title: "Password reset page could not load",
    description: "Try again or return to sign in.",
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
    title: "Password reset link could not open",
    description:
      "Try opening the link again or request a new password reset email.",
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
    title: "Account activation could not finish",
    description: "Try opening the activation link again or return to sign up.",
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
