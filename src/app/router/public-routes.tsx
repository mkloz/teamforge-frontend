import { createRoute, redirect } from "@tanstack/react-router";

import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import { createLazyRouteLoading } from "@/app/router/lazy-route-loading";
import {
  createLazyRouteModule,
  type LazyRouteModule,
} from "@/app/router/lazy-route-module";
import { rootRoute } from "@/app/router/root-route";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { redirectAuthenticatedUser } from "@/app/router/route-guards";
import { RouteLoadingFallback } from "@/shared/components/loading/route-loading-fallback";
import {
  buildAuthRouteNavigation,
  parseAuthReturnSearch,
} from "@/shared/lib/auth-route";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

const landingPageModule = createLazyRouteModule(() =>
  import("@/features/landing/landing-page").then((m) => ({
    default: m.LandingPage,
  })),
);

const LandingRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/landing/landing-page.loading").then((m) => ({
      default: m.LandingPageLoading,
    })),
  { mode: "route" },
);

const downloadPageModule = createLazyRouteModule(() =>
  import("@/features/download/download-page").then((m) => ({
    default: m.DownloadPage,
  })),
);

const iconNoticeVariantsPageModule = createLazyRouteModule(() =>
  import("@/features/design-system/icon-notice-variants-page").then((m) => ({
    default: m.IconNoticeVariantsPage,
  })),
);

const DOWNLOAD_PREVIEW_IMAGES = {
  android: {
    sizes: "(min-width: 640px) 17rem, min(20rem, calc(100vw - 3rem))",
    src: "/download/install-preview-android.png",
    srcSet:
      "/download/install-preview-android-256w.png 256w, /download/install-preview-android-360w.png 360w, /download/install-preview-android.png 465w",
  },
  desktop: {
    sizes: "(min-width: 1024px) 30rem, min(30rem, calc(100vw - 3rem))",
    src: "/download/install-preview-desktop.png",
    srcSet:
      "/download/install-preview-desktop-480w.png 480w, /download/install-preview-desktop.png 815w",
  },
  ios: {
    sizes: "(min-width: 1024px) 35rem, min(35rem, calc(100vw - 3rem))",
    src: "/download/install-preview-ios.png",
    srcSet:
      "/download/install-preview-ios-480w.png 480w, /download/install-preview-ios-720w.png 720w, /download/install-preview-ios.png 984w",
  },
} as const;

type DownloadPreviewDevice = keyof typeof DOWNLOAD_PREVIEW_IMAGES;

const privacyPageModule = createLazyRouteModule(() =>
  import("@/features/legal/legal-page").then((m) => ({
    default: () => <m.LegalPage kind="privacy" />,
  })),
);

const PrivacyRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/legal/legal-page.loading").then((m) => ({
      default: m.LegalPageLoading,
    })),
  { kind: "privacy", mode: "route" },
);

const termsPageModule = createLazyRouteModule(() =>
  import("@/features/legal/legal-page").then((m) => ({
    default: () => <m.LegalPage kind="terms" />,
  })),
);

const TermsRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/legal/legal-page.loading").then((m) => ({
      default: m.LegalPageLoading,
    })),
  { kind: "terms", mode: "route" },
);

const loginPageModule = createLazyRouteModule(() =>
  import("@/features/auth/login-page").then((m) => ({
    default: m.LoginPage,
  })),
);

const LoginRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/auth/auth-page.loading").then((m) => ({
      default: m.AuthPageLoading,
    })),
  { mode: "route", variant: "login" },
);

const registerPageModule = createLazyRouteModule(() =>
  import("@/features/auth/register-page").then((m) => ({
    default: m.RegisterPage,
  })),
);

const RegisterRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/auth/auth-page.loading").then((m) => ({
      default: m.AuthPageLoading,
    })),
  { mode: "route", variant: "register" },
);

const forgotPasswordPageModule = createLazyRouteModule(() =>
  import("@/features/auth/forgot-password-page").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);

const ForgotPasswordRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/auth/auth-page.loading").then((m) => ({
      default: m.AuthPageLoading,
    })),
  { mode: "route", variant: "forgot-password" },
);

const resetPasswordPageModule = createLazyRouteModule(() =>
  import("@/features/auth/reset-password-page").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

const ResetPasswordRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/auth/auth-page.loading").then((m) => ({
      default: m.AuthPageLoading,
    })),
  { mode: "route", variant: "reset-password" },
);

const activateAccountPageModule = createLazyRouteModule(() =>
  import("@/features/auth/activate-account-page").then((m) => ({
    default: m.ActivateAccountPage,
  })),
);

const ActivateAccountRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/auth/auth-page.loading").then((m) => ({
      default: m.AuthPageLoading,
    })),
  { mode: "route", variant: "activate" },
);

function createRouteModuleLoader(module: LazyRouteModule) {
  return async () => {
    await module.preload();
  };
}

function getDownloadPreviewImageForDevice() {
  if (typeof navigator === "undefined") {
    return DOWNLOAD_PREVIEW_IMAGES.desktop;
  }

  return DOWNLOAD_PREVIEW_IMAGES[getDownloadPreviewDevice()];
}

function getDownloadPreviewDevice(): DownloadPreviewDevice {
  if (isIosLikeDevice()) {
    return "ios";
  }

  if (isAndroidDevice()) {
    return "android";
  }

  return "desktop";
}

function getNavigatorUserAgent() {
  return navigator.userAgent;
}

function isIosLikeDevice() {
  const userAgent = getNavigatorUserAgent();

  return isIosUserAgent(userAgent.toLowerCase()) || isTouchMac(userAgent);
}

function isIosUserAgent(userAgent: string) {
  return /iphone|ipad|ipod/.test(userAgent);
}

function isTouchMac(userAgent: string) {
  return userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1;
}

function isAndroidDevice() {
  return getNavigatorUserAgent().toLowerCase().includes("android");
}

function preloadDownloadPreviewImage() {
  if (typeof document === "undefined") {
    return;
  }

  const image = getDownloadPreviewImageForDevice();
  const existingPreload = document.head.querySelector(
    `link[rel="preload"][as="image"][href="${image.src}"]`,
  );

  if (existingPreload) {
    return;
  }

  const link = document.createElement("link");
  link.rel = "preload";
  link.setAttribute("as", "image");
  link.setAttribute("href", image.src);
  link.setAttribute("imagesrcset", image.srcSet);
  link.setAttribute("imagesizes", image.sizes);
  link.setAttribute("fetchpriority", "high");
  document.head.appendChild(link);
}

function createDownloadRouteModuleLoader(module: LazyRouteModule) {
  return async () => {
    preloadDownloadPreviewImage();
    await module.preload();
  };
}

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: createLazyPageRoute(
    landingPageModule.Component,
    <LandingRouteLoading />,
  ),
});

const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/download",
  loader: createDownloadRouteModuleLoader(downloadPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: RouteLoadingFallback,
  component: createLazyPageRoute(downloadPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.download,
    fullPage: true,
    title: "Download page could not finish loading",
    description:
      "TeamForge couldn't finish loading install guidance right now.",
    fallbackTo: "/",
    fallbackLabel: "Back home",
  }),
});

const iconNoticeVariantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/design-system/icon-notice-variants",
  component: createLazyPageRoute(iconNoticeVariantsPageModule.Component),
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  loader: createRouteModuleLoader(privacyPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: PrivacyRouteLoading,
  component: createLazyPageRoute(
    privacyPageModule.Component,
    <PrivacyRouteLoading />,
  ),
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  loader: createRouteModuleLoader(termsPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: TermsRouteLoading,
  component: createLazyPageRoute(
    termsPageModule.Component,
    <TermsRouteLoading />,
  ),
});

const authRoute = createRoute({
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
    <LoginRouteLoading />,
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
    <RegisterRouteLoading />,
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
    <ForgotPasswordRouteLoading />,
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
    <ResetPasswordRouteLoading />,
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
    <ActivateAccountRouteLoading />,
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

export const publicRoutes = [
  landingRoute,
  downloadRoute,
  ...(import.meta.env.DEV ? [iconNoticeVariantsRoute] : []),
  privacyRoute,
  termsRoute,
  authRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  activateAccountRoute,
];
