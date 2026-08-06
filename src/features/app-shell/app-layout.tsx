import { Outlet } from "@tanstack/react-router";
import { Activity, lazy, type ReactNode, Suspense } from "react";
import { AppBottomNav } from "@/features/app-shell/components/app-bottom-nav";
import { AppRouteTransition } from "@/features/app-shell/components/app-route-transition";
import { useActivePathname } from "@/features/app-shell/hooks/use-active-pathname";
import { useAppNavbarCounters } from "@/features/app-shell/hooks/use-app-navbar-counters";
import { useAppShellScrollReset } from "@/features/app-shell/hooks/use-app-shell-scroll-reset";
import { OnboardingCoachmarks } from "@/features/onboarding/public/onboarding-coachmarks";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/store/ui.store";

const AppSidebar = lazy(() =>
  import("@/features/app-shell/components/app-sidebar").then((module) => ({
    default: module.AppSidebar,
  })),
);

interface AppLayoutProps {
  notificationTrigger?: ReactNode;
  notificationDrawer?: ReactNode;
}

export function AppLayout({
  notificationTrigger,
  notificationDrawer,
}: AppLayoutProps) {
  const bottomNavHidden = useUiStore((state) => state.bottomNavHidden);
  const navbarCounters = useAppNavbarCounters();
  const pathname = useActivePathname();
  const shouldRenderSidebar = useMediaQuery("(min-width: 768px)");

  useAppShellScrollReset();

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas font-sans text-foreground">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-100 -translate-y-24 rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground opacity-0 transition focus:translate-y-0 focus:opacity-100"
      >
        Skip to main content
      </a>

      {shouldRenderSidebar ? (
        <Suspense fallback={null}>
          <AppSidebar
            activityUnreadCount={navbarCounters.activityUnreadCount}
            notificationTrigger={notificationTrigger}
          />
        </Suspense>
      ) : null}

      <main
        id="main-content"
        className={cn(
          "min-h-screen md:pb-4 md:pl-14",
          bottomNavHidden ? "pb-0" : "pb-app-bottom-nav",
        )}
        tabIndex={-1}
      >
        <div>
          <AppRouteTransition>
            <Outlet />
          </AppRouteTransition>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <Activity mode={bottomNavHidden ? "hidden" : "visible"}>
        <AppBottomNav
          activityUnreadCount={navbarCounters.activityUnreadCount}
          notificationUnreadCount={navbarCounters.notificationUnreadCount}
        />
      </Activity>

      {notificationDrawer}
      <OnboardingCoachmarks pathname={pathname} />
    </div>
  );
}
