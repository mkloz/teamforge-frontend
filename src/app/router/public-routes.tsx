import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";

import { LazyPage } from "@/app/router/lazy-page";
import { rootRoute } from "@/app/router/root-route";
import { redirectAuthenticatedUser } from "@/app/router/route-guards";
import { RouteErrorState } from "@/shared/components/route-error-state";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

const LandingPage = lazy(() =>
  import("@/features/landing/landing-page").then((m) => ({
    default: m.LandingPage,
  })),
);

const LoginPage = lazy(() =>
  import("@/features/auth/auth-page").then((m) => ({
    default: function LoginRoute() {
      return <m.AuthPage defaultView="login" />;
    },
  })),
);

const RegisterPage = lazy(() =>
  import("@/features/auth/auth-page").then((m) => ({
    default: function RegisterRoute() {
      return <m.AuthPage defaultView="register" />;
    },
  })),
);

const ForgotPasswordPage = lazy(() =>
  import("@/features/auth/forgot-password-page").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);

const ResetPasswordPage = lazy(() =>
  import("@/features/auth/reset-password-page").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

const ActivateAccountPage = lazy(() =>
  import("@/features/auth/activate-account-page").then((m) => ({
    default: m.ActivateAccountPage,
  })),
);

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <LazyPage component={LandingPage} />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  beforeLoad: redirectAuthenticatedUser,
  component: () => <LazyPage component={LoginPage} />,
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
  component: () => <LazyPage component={RegisterPage} />,
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
  component: () => <LazyPage component={ForgotPasswordPage} />,
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
  component: () => <LazyPage component={ResetPasswordPage} />,
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
  component: () => <LazyPage component={ActivateAccountPage} />,
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

export const publicRoutes = [
  landingRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  activateAccountRoute,
];
