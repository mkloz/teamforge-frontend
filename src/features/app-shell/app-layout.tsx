import { Outlet } from "@tanstack/react-router";
import { Activity, type ReactNode, Suspense } from "react";
import { AppBottomNav } from "@/features/app-shell/components/app-bottom-nav";
import { AppSidebar } from "@/features/app-shell/components/app-sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { useUiStore } from "@/shared/store/ui.store";

function PageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4" aria-hidden="true">
      <div className="h-8 w-48 rounded-xl bg-muted" />
      <div className="h-4 w-full rounded-lg bg-muted" />
      <div className="h-4 w-3/4 rounded-lg bg-muted" />
      <div className="mt-2 h-40 w-full rounded-xl bg-muted" />
    </div>
  );
}

interface AppLayoutProps {
  notificationTrigger?: ReactNode;
  notificationDrawer?: ReactNode;
}

export function AppLayout({
  notificationTrigger,
  notificationDrawer,
}: AppLayoutProps) {
  const bottomNavHidden = useUiStore((state) => state.bottomNavHidden);

  return (
    <TooltipProvider>
      <div className="min-h-screen overflow-x-clip bg-canvas font-sans text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:font-medium focus:text-primary-foreground"
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
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        {/* Mobile bottom navigation */}
        <Activity mode={bottomNavHidden ? "hidden" : "visible"}>
          <AppBottomNav />
        </Activity>

        {notificationDrawer}
      </div>
    </TooltipProvider>
  );
}
