import { lazy, Suspense } from "react";
import { PlanLoadingMark } from "@/shared/components/loading/plan-loading-mark";
import { loadAppShellWithNotifications } from "./app-shell-route-loaders";

const AppShellWithNotifications = lazy(loadAppShellWithNotifications);

export function AppShellRouteComponent() {
  return (
    <Suspense fallback={<AppShellRouteLoading />}>
      <AppShellWithNotifications />
    </Suspense>
  );
}

export function AppShellRouteLoading() {
  return (
    <div className="loading-canvas-glow flex min-h-dvh items-center justify-center px-6 text-ink">
      <PlanLoadingMark label="Loading Findafew" size="md" />
    </div>
  );
}
