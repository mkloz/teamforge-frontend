import { createRoute } from "@tanstack/react-router";

import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import { createLazyRouteModule } from "@/app/router/lazy-route-module";
import { rootRoute } from "@/app/router/root-route";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { redirectAuthenticatedUser } from "@/app/router/route-guards";
import { AuthPageLoading } from "@/features/auth/auth-page.loading";
import { LandingPageLoading } from "@/features/landing/landing-page.loading";
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

const visualStatesPageModule = createLazyRouteModule(() =>
  import("@/features/design-system/visual-states-page").then((m) => ({
    default: m.VisualStatesPage,
  })),
);

const activitySkeletonCaptureModule = createLazyRouteModule(() =>
  import("@/features/activity/activity-page-skeleton-capture").then((m) => ({
    default: m.ActivityPageSkeletonCapture,
  })),
);

const authSkeletonCaptureModule = createLazyRouteModule(() =>
  import("@/features/auth/auth-skeleton-capture").then((m) => ({
    default: m.AuthSkeletonCapture,
  })),
);

const landingSkeletonCaptureModule = createLazyRouteModule(() =>
  import("@/features/landing/landing-page-skeleton-capture").then((m) => ({
    default: m.LandingPageSkeletonCapture,
  })),
);

const onboardingSkeletonCaptureModule = createLazyRouteModule(() =>
  import("@/features/onboarding/onboarding-skeleton-capture").then((m) => ({
    default: m.OnboardingSkeletonCapture,
  })),
);

const profileSkeletonCaptureModule = createLazyRouteModule(() =>
  import("@/features/profile/profile-page/profile-page-skeleton-capture").then(
    (m) => ({
      default: m.ProfilePageSkeletonCapture,
    }),
  ),
);

const settingsSkeletonCaptureModule = createLazyRouteModule(() =>
  import(
    "@/features/settings/settings-page/settings-page-skeleton-capture"
  ).then((m) => ({
    default: m.SettingsPageSkeletonCapture,
  })),
);

const homeSkeletonCaptureModule = createLazyRouteModule(() =>
  import("@/features/home/home-page-skeleton-capture").then((m) => ({
    default: m.HomePageSkeletonCapture,
  })),
);

const exploreSkeletonCaptureModule = createLazyRouteModule(() =>
  import("@/features/explore/explore-page-skeleton-capture").then((m) => ({
    default: m.ExplorePageSkeletonCapture,
  })),
);

const forgeSkeletonCaptureModule = createLazyRouteModule(() =>
  import("@/features/forge/forge-page-skeleton-capture").then((m) => ({
    default: m.ForgePageSkeletonCapture,
  })),
);

const sectionSkeletonCaptureModule = createLazyRouteModule(() =>
  import("@/features/design-system/skeleton-section-previews-page").then(
    (m) => ({
      default: m.SkeletonSectionPreviewsPage,
    }),
  ),
);

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: createLazyPageRoute(
    landingPageModule.Component,
    <LandingPageLoading mode="route" />,
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/login",
  beforeLoad: redirectAuthenticatedUser,
  component: createLazyPageRoute(
    loginPageModule.Component,
    <AuthPageLoading mode="route" variant="login" />,
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
    <AuthPageLoading mode="route" variant="register" />,
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
    <AuthPageLoading mode="route" variant="forgot-password" />,
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
    <AuthPageLoading mode="route" variant="reset-password" />,
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
    <AuthPageLoading mode="route" variant="activate" />,
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

const designSystemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system",
  component: createLazyPageRoute(visualStatesPageModule.Component),
});

const visualStatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/visual-states",
  component: createLazyPageRoute(visualStatesPageModule.Component),
});

const activitySkeletonCaptureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/skeletons/activity",
  component: createLazyPageRoute(activitySkeletonCaptureModule.Component),
});

const authSkeletonCaptureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/skeletons/auth",
  component: createLazyPageRoute(authSkeletonCaptureModule.Component),
});

const landingSkeletonCaptureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/skeletons/landing",
  component: createLazyPageRoute(landingSkeletonCaptureModule.Component),
});

const onboardingSkeletonCaptureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/skeletons/onboarding",
  component: createLazyPageRoute(onboardingSkeletonCaptureModule.Component),
});

const profileSkeletonCaptureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/skeletons/profile",
  component: createLazyPageRoute(profileSkeletonCaptureModule.Component),
});

const settingsSkeletonCaptureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/skeletons/settings",
  component: createLazyPageRoute(settingsSkeletonCaptureModule.Component),
});

const homeSkeletonCaptureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/skeletons/home",
  component: createLazyPageRoute(homeSkeletonCaptureModule.Component),
});

const exploreSkeletonCaptureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/skeletons/explore",
  component: createLazyPageRoute(exploreSkeletonCaptureModule.Component),
});

const forgeSkeletonCaptureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/skeletons/forge",
  component: createLazyPageRoute(forgeSkeletonCaptureModule.Component),
});

const sectionSkeletonCaptureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/skeletons/sections",
  component: createLazyPageRoute(sectionSkeletonCaptureModule.Component),
});

const designSystemRoutes = import.meta.env.DEV
  ? [
      designSystemRoute,
      visualStatesRoute,
      activitySkeletonCaptureRoute,
      authSkeletonCaptureRoute,
      exploreSkeletonCaptureRoute,
      forgeSkeletonCaptureRoute,
      homeSkeletonCaptureRoute,
      landingSkeletonCaptureRoute,
      onboardingSkeletonCaptureRoute,
      profileSkeletonCaptureRoute,
      sectionSkeletonCaptureRoute,
      settingsSkeletonCaptureRoute,
    ]
  : [];

export const publicRoutes = [
  landingRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  activateAccountRoute,
  ...designSystemRoutes,
];

export const publicRouteModules = [
  landingPageModule,
  loginPageModule,
  registerPageModule,
  forgotPasswordPageModule,
  resetPasswordPageModule,
  activateAccountPageModule,
  ...(import.meta.env.DEV
    ? [
        visualStatesPageModule,
        activitySkeletonCaptureModule,
        authSkeletonCaptureModule,
        exploreSkeletonCaptureModule,
        forgeSkeletonCaptureModule,
        homeSkeletonCaptureModule,
        landingSkeletonCaptureModule,
        onboardingSkeletonCaptureModule,
        profileSkeletonCaptureModule,
        sectionSkeletonCaptureModule,
        settingsSkeletonCaptureModule,
      ]
    : []),
];
