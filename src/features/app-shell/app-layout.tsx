import { useTheme } from "@/shared/store/theme.store";
import { Outlet } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { NotificationsDrawer } from "../notifications/components/notifications-drawer";
import { NotificationsBellTrigger } from "../notifications/components/notifications-bell-trigger";
import { UserMenu } from "../user-menu/components/user-menu";
import { AppBottomNav } from "./components/app-bottom-nav";
import { AppSidebar } from "./components/app-sidebar";
import { AppTopbar } from "./components/app-topbar";
import { SearchOverlay } from "./components/search-overlay";
import { ForgeOverlay } from "../forge/components/forge-overlay";

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

  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [forgeOpen, setForgeOpen] = useState(false);

  const handleForge = () => setForgeOpen(true);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Skip to content link for keyboard / screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Persistent top bar */}
      <AppTopbar
        onSearchClick={() => setSearchOpen(true)}
        notificationsTrigger={
          <NotificationsBellTrigger
            onClick={() => setNotificationsOpen(true)}
          />
        }
        userMenuSlot={<UserMenu />}
      />

      {/* Desktop sidebar */}
      <AppSidebar onForgeClick={handleForge} />

      {/* Main content area */}
      <main
        id="main-content"
        className="pt-16 md:pl-16 lg:pl-60 pb-24 md:pb-8 min-h-screen"
        tabIndex={-1}
      >
        {/* Content wrapper — pages define their own max-width as needed */}
        <div className="px-4 py-6">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <AppBottomNav onForgeClick={handleForge} />

      {/* Overlays */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <ForgeOverlay
        open={forgeOpen}
        onClose={() => setForgeOpen(false)}
      />
    </div>
  );
}
