import { createRoute } from "@tanstack/react-router";
import { requireAdminRoute } from "@/app/router/admin-route-guard";
import { rootRoute } from "@/app/router/root-route";
import { AdminCasePage } from "@/features/admin/admin-case-page";
import { AdminLayout } from "@/features/admin/admin-layout";
import { AdminModerationPage } from "@/features/admin/admin-moderation-page";
import { AdminOperationsPage } from "@/features/admin/admin-operations-page";
import { AdminOverviewPage } from "@/features/admin/admin-overview-page";
import { AdminSettingsPage } from "@/features/admin/admin-settings-page";
import {
  AdminAccessUnavailable,
  AdminRouteLoading,
} from "@/features/admin/components/admin-route-states";

const adminBaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: requireAdminRoute,
  component: AdminLayout,
  pendingComponent: AdminRouteLoading,
  errorComponent: ({ reset }) => <AdminAccessUnavailable onRetry={reset} />,
});

const adminOverviewRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/",
  component: AdminOverviewPage,
});

const adminModerationRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation",
  component: AdminModerationPage,
});

const adminCaseRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/cases/$caseId",
  component: AdminCasePage,
});

const adminOperationsRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/operations",
  component: AdminOperationsPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/settings",
  component: AdminSettingsPage,
});

export const adminRoute = adminBaseRoute.addChildren([
  adminOverviewRoute,
  adminModerationRoute,
  adminCaseRoute,
  adminOperationsRoute,
  adminSettingsRoute,
]);
