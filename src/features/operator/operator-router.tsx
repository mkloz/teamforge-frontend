import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { OperatorLoading } from "@/features/operator/components/operator-states";
import { OperatorLayout } from "@/features/operator/operator-layout";
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

const operatorRootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: OperatorNotFound,
});

const operatorShellRoute = createRoute({
  getParentRoute: () => operatorRootRoute,
  path: "/operator",
  component: OperatorLayout,
});

const operatorWorkspaceRoute = createRoute({
  getParentRoute: () => operatorShellRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    queue: operatorQueueSchema.safeParse(search.queue).data ?? "CRITICAL_NOW",
  }),
  component: () => (
    <Suspense fallback={<OperatorLoading />}>
      <OperatorWorkspacePage />
    </Suspense>
  ),
});

const operatorCaseRoute = createRoute({
  getParentRoute: () => operatorShellRoute,
  path: "/cases/$caseId",
  component: () => (
    <Suspense fallback={<OperatorLoading />}>
      <OperatorCaseDetailPage />
    </Suspense>
  ),
});

const operatorIntakeRoute = createRoute({
  getParentRoute: () => operatorShellRoute,
  path: "/intake",
  component: () => (
    <Suspense fallback={<OperatorLoading />}>
      <OperatorIntakePage />
    </Suspense>
  ),
});

const operatorOperationsRoute = createRoute({
  getParentRoute: () => operatorShellRoute,
  path: "/operations",
  component: () => (
    <Suspense fallback={<OperatorLoading />}>
      <OperatorWorkerOperationsPage />
    </Suspense>
  ),
});

const routeTree = operatorRootRoute.addChildren([
  operatorShellRoute.addChildren([
    operatorWorkspaceRoute,
    operatorCaseRoute,
    operatorIntakeRoute,
    operatorOperationsRoute,
  ]),
]);

export const operatorRouter = createRouter({
  routeTree,
  defaultPreload: false,
  defaultPendingMs: 250,
});

function OperatorNotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas p-6 text-center">
      <div className="grid gap-2">
        <h1 className="font-bold text-2xl text-ink">
          Workspace page not found
        </h1>
        <p className="text-slate-muted text-sm">
          Return to the operator queue you were reviewing.
        </p>
      </div>
    </div>
  );
}
