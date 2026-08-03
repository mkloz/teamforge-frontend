import { createRoute } from "@tanstack/react-router";
import { createElement } from "react";

import { createLazyPageRoute } from "@/app/router/lazy-page-route";
import {
  downloadPageModule,
  externalInvitePageModule,
  externalInviteTokenPageModule,
  LandingRouteLoading,
  landingPageModule,
  PrivacyRouteLoading,
  privacyPageModule,
  TermsRouteLoading,
  termsPageModule,
} from "@/app/router/public-routes/lazy-public-route-modules";
import {
  createDownloadRouteModuleLoader,
  createRouteModuleLoader,
} from "@/app/router/public-routes/route-loaders";
import { rootRoute } from "@/app/router/root-route";
import { createRouteErrorComponent } from "@/app/router/route-error-component";
import { RouteLoadingFallback } from "@/shared/components/loading/route-loading-fallback";
import { routeErrorScopes } from "@/shared/lib/telemetry-contract";

export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: createLazyPageRoute(
    landingPageModule.Component,
    createElement(LandingRouteLoading),
  ),
});

export const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/download",
  loader: createDownloadRouteModuleLoader(downloadPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: RouteLoadingFallback,
  component: createLazyPageRoute(downloadPageModule.Component),
  errorComponent: createRouteErrorComponent({
    scope: routeErrorScopes.download,
    fullPage: true,
    title: "Download page could not load",
    description: "The installation guide did not load.",
    fallbackTo: "/",
    fallbackLabel: "Back home",
  }),
});

export const externalInviteTokenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invite/$token",
  component: createLazyPageRoute(externalInviteTokenPageModule.Component),
});

export const externalInviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invite",
  component: createLazyPageRoute(externalInvitePageModule.Component),
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  loader: createRouteModuleLoader(privacyPageModule),
  staleTime: Number.POSITIVE_INFINITY,
  pendingComponent: PrivacyRouteLoading,
  component: createLazyPageRoute(
    privacyPageModule.Component,
    createElement(PrivacyRouteLoading),
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
    createElement(TermsRouteLoading),
  ),
});

export const legalPublicRoutes = [privacyRoute, termsRoute];
