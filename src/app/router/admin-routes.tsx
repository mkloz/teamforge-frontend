import { createRoute } from "@tanstack/react-router";
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
import { parseOperatorAuditSearch } from "@/features/operator/lib/operator-audit-route";
import {
  parseOperatorCaseReturnSearch,
  parseOperatorListSearch,
  parseOperatorModerationSearch,
} from "@/features/operator/lib/operator-route";
import { OperatorAuditPage } from "@/features/operator/operator-audit-page";
import { OperatorCaseDetailPage } from "@/features/operator/operator-case-detail-page";
import { OperatorIntakePage } from "@/features/operator/operator-intake-page";
import { OperatorQueueHealthPage } from "@/features/operator/operator-queue-health-page";
import { OperatorWorkerOperationsPage } from "@/features/operator/operator-worker-operations-page";
import { OperatorWorkspacePage } from "@/features/operator/operator-workspace-page";

const adminBaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: ({ location }) => requireAdminRoute(location),
  component: AdminLayout,
  pendingComponent: AdminRouteLoading,
  errorComponent: ({ reset }) => <AdminAccessUnavailable onRetry={reset} />,
});

const adminOverviewRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/",
  component: AdminOverviewPage,
});

const adminAuditRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/audit",
  validateSearch: (search: Record<string, unknown>) =>
    parseOperatorAuditSearch(search),
  component: OperatorAuditPage,
});

const adminModerationRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation",
  validateSearch: (search: Record<string, unknown>) =>
    parseOperatorModerationSearch(search),
  component: OperatorWorkspacePage,
});

const adminCaseRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/cases/$caseId",
  validateSearch: (search: Record<string, unknown>) =>
    parseOperatorCaseReturnSearch(search),
  component: OperatorCaseDetailPage,
});

const adminIntakeRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/intake",
  validateSearch: (search: Record<string, unknown>) =>
    parseOperatorListSearch(search),
  component: OperatorIntakePage,
});

const adminWorkersRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/workers",
  component: OperatorWorkerOperationsPage,
});

const adminOperationsRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/operations",
  component: AdminOperationsPage,
});

const adminQueueHealthRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/operations/queue-health",
  component: OperatorQueueHealthPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/settings",
  component: AdminSettingsPage,
});

export const adminRoute = adminBaseRoute.addChildren([
  adminOverviewRoute,
  adminAuditRoute,
  adminModerationRoute,
  adminCaseRoute,
  adminIntakeRoute,
  adminWorkersRoute,
  adminOperationsRoute,
  adminQueueHealthRoute,
  adminSettingsRoute,
]);
