import { createRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { requireAdminRoute } from "@/app/router/admin-route-guard";
import { rootRoute } from "@/app/router/root-route";
import { AdminLayout } from "@/features/admin/admin-layout";
import { AdminOperationsPage } from "@/features/admin/admin-operations-page";
import { AdminOverviewPage } from "@/features/admin/admin-overview-page";
import { AdminSettingsPage } from "@/features/admin/admin-settings-page";
import {
  AdminAccessUnavailable,
  AdminRouteLoading,
} from "@/features/admin/components/admin-route-states";
import { OperatorLoading } from "@/features/operator/components/operator-states";
import { operatorQueueSchema } from "@/features/operator/schemas/operator.schemas";

const OperatorWorkspacePage = lazy(() =>
  import("@/features/operator/operator-workspace-page").then((module) => ({
    default: module.OperatorWorkspacePage,
  })),
);

const OperatorCaseDetailPage = lazy(() =>
  import("@/features/operator/operator-case-detail-page").then((module) => ({
    default: module.OperatorCaseDetailPage,
  })),
);

const OperatorIntakePage = lazy(() =>
  import("@/features/operator/operator-intake-page").then((module) => ({
    default: module.OperatorIntakePage,
  })),
);

const OperatorWorkerOperationsPage = lazy(() =>
  import("@/features/operator/operator-worker-operations-page").then(
    (module) => ({ default: module.OperatorWorkerOperationsPage }),
  ),
);

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
  validateSearch: (search: Record<string, unknown>) => ({
    queue: operatorQueueSchema.safeParse(search.queue).data ?? "CRITICAL_NOW",
  }),
  component: () => (
    <Suspense fallback={<OperatorLoading />}>
      <OperatorWorkspacePage />
    </Suspense>
  ),
});

const adminCaseRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/cases/$caseId",
  component: () => (
    <Suspense fallback={<OperatorLoading />}>
      <OperatorCaseDetailPage />
    </Suspense>
  ),
});

const adminIntakeRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/intake",
  component: () => (
    <Suspense fallback={<OperatorLoading />}>
      <OperatorIntakePage />
    </Suspense>
  ),
});

const adminWorkersRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/workers",
  component: () => (
    <Suspense fallback={<OperatorLoading />}>
      <OperatorWorkerOperationsPage />
    </Suspense>
  ),
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
  adminIntakeRoute,
  adminWorkersRoute,
  adminOperationsRoute,
  adminSettingsRoute,
]);
