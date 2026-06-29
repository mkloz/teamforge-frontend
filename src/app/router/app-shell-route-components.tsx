import { lazy, Suspense } from "react";
import { ForgeLoadingMark } from "@/shared/components/loading/forge-loading-mark";
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
      <ForgeLoadingMark label="Loading TeamForge" size="md" />
    </div>
  );
}
