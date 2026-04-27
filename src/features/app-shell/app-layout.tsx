import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { useUiStore } from "@/shared/store/ui.store";
import { useTheme } from "@/shared/store/theme.store";
import { Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { NotificationsBellTrigger } from "../notifications/components/notifications-bell-trigger";
import { NotificationsDrawer } from "../notifications/components/notifications-drawer";
import { AppBottomNav } from "./components/app-bottom-nav";
import { AppSidebar } from "./components/app-sidebar";

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-hidden="true">
      <div className="h-8 w-48 rounded-xl bg-muted" />
      <div className="h-4 w-full rounded-lg bg-muted" />
      <div className="h-4 w-3/4 rounded-lg bg-muted" />
      <div className="h-40 w-full rounded-2xl bg-muted mt-2" />
    </div>
  );
}

export function AppLayout() {
  // Ensure theme class is applied on every render of the authenticated shell
  useTheme();

  const { notificationsOpen, bottomNavHidden, setNotificationsOpen } =
    useUiStore();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-canvas text-foreground font-sans">
        {/* Skip to content link for keyboard / screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:font-medium"
        >
          Skip to main content
        </a>

        {/* Persistent top bar removed for desktop per user request */}

        {/* Desktop sidebar */}
        <AppSidebar
          notificationsTrigger={
            <NotificationsBellTrigger
              onClick={() => setNotificationsOpen(true)}
            />
          }
        />

        {/* Main content area */}
        <main
          id="main-content"
          className="md:pl-14 pb-20 md:pb-4 min-h-screen"
          tabIndex={-1}
        >
          {/* Content wrapper — pages define their own max-width as needed */}
          <div>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

        {/* Mobile bottom navigation */}
        {!bottomNavHidden && <AppBottomNav />}

        {/* Overlays */}
        <NotificationsDrawer
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />
      </div>
    </TooltipProvider>
  );
}
