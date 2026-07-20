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
import { OperatorCaseDetailPage } from "@/features/operator/operator-case-detail-page";
import { OperatorIntakePage } from "@/features/operator/operator-intake-page";
import { OperatorWorkerOperationsPage } from "@/features/operator/operator-worker-operations-page";
import { OperatorWorkspacePage } from "@/features/operator/operator-workspace-page";
import {
  type OperatorQueue,
  operatorQueueSchema,
} from "@/features/operator/schemas/operator.schemas";

type OperatorListSearch = {
  page?: number;
};

type OperatorModerationSearch = OperatorListSearch & {
  queue: OperatorQueue;
};

function parseOperatorPage(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") {
    return undefined;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : undefined;
}

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

const adminModerationRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation",
  validateSearch: (
    search: Record<string, unknown>,
  ): OperatorModerationSearch => ({
    queue: operatorQueueSchema.safeParse(search.queue).data ?? "CRITICAL_NOW",
    page: parseOperatorPage(search.page),
  }),
  component: OperatorWorkspacePage,
});

const adminCaseRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/cases/$caseId",
  component: OperatorCaseDetailPage,
});

const adminIntakeRoute = createRoute({
  getParentRoute: () => adminBaseRoute,
  path: "/moderation/intake",
  validateSearch: (search: Record<string, unknown>): OperatorListSearch => ({
    page: parseOperatorPage(search.page),
  }),
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
