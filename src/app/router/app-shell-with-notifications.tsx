import { Bell } from "lucide-react";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/features/app-shell/app-layout";
import { useNotificationsDrawerState } from "@/features/notifications/hooks/use-notifications-drawer-state";
import { cn } from "@/shared/lib/utils";

const NotificationsBellTrigger = lazy(() =>
  import("@/features/notifications/components/notifications-bell-trigger").then(
    (module) => ({ default: module.NotificationsBellTrigger }),
  ),
);

const NotificationsDrawer = lazy(() =>
  import("@/features/notifications/components/notifications-drawer").then(
    (module) => ({ default: module.NotificationsDrawer }),
  ),
);

export function AppShellWithNotifications() {
  const { open, openDrawer, closeDrawer } = useNotificationsDrawerState();

  return (
    <AppLayout
      notificationTrigger={
        <Suspense
          fallback={
            <NotificationsBellFallback onClick={() => void openDrawer()} />
          }
        >
          <NotificationsBellTrigger onClick={() => void openDrawer()} />
        </Suspense>
      }
      notificationDrawer={
        open ? (
          <Suspense fallback={null}>
            <NotificationsDrawer
              open={open}
              onClose={() => void closeDrawer()}
            />
          </Suspense>
        ) : null
      }
    />
  );
}

function NotificationsBellFallback({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Notifications"
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-lg",
        "text-slate-muted transition-colors duration-150 hover:bg-muted hover:text-ink",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
      )}
    >
      <Bell size={18} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
