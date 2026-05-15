import { Outlet } from "@tanstack/react-router";
import { Activity, type ReactNode, Suspense } from "react";
import { AppBottomNav } from "@/features/app-shell/components/app-bottom-nav";
import { AppRouteTransition } from "@/features/app-shell/components/app-route-transition";
import { AppSidebar } from "@/features/app-shell/components/app-sidebar";
import { useAppShellScrollReset } from "@/features/app-shell/hooks/use-app-shell-scroll-reset";
import { RouteLoadingFallback } from "@/shared/components/loading/route-loading-fallback";
import { useUiStore } from "@/shared/store/ui.store";

interface AppLayoutProps {
  notificationTrigger?: ReactNode;
  notificationDrawer?: ReactNode;
}

export function AppLayout({
  notificationTrigger,
  notificationDrawer,
}: AppLayoutProps) {
  const bottomNavHidden = useUiStore((state) => state.bottomNavHidden);

  useAppShellScrollReset();

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas font-sans text-foreground">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-100 -translate-y-24 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground opacity-0 transition focus:translate-y-0 focus:opacity-100"
      >
        Skip to main content
      </a>

      <AppSidebar notificationTrigger={notificationTrigger} />

      <main
        id="main-content"
        className="min-h-screen pb-28 md:pb-4 md:pl-14"
        tabIndex={-1}
      >
        <div>
          <AppRouteTransition>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Outlet />
            </Suspense>
          </AppRouteTransition>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <Activity mode={bottomNavHidden ? "hidden" : "visible"}>
        <AppBottomNav />
      </Activity>

      {notificationDrawer}
    </div>
  );
}
