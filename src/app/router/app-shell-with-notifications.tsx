import { Bell } from "lucide-react";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/features/app-shell/app-layout";
import { NotificationsDrawer } from "@/features/notifications/components/notifications-drawer";
import { useNotificationsDrawerState } from "@/features/notifications/hooks/use-notifications-drawer-state";
import { Button } from "@/shared/components/ui/button";

const NotificationsBellTrigger = lazy(() =>
  import("@/features/notifications/components/notifications-bell-trigger").then(
    (module) => ({ default: module.NotificationsBellTrigger }),
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
        <NotificationsDrawer open={open} onClose={() => void closeDrawer()} />
      }
    />
  );
}

function NotificationsBellFallback({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label="Notifications"
      className="relative size-10 shrink-0 rounded-lg text-slate-muted hover:enabled:bg-muted hover:enabled:text-ink"
    >
      <Bell size={18} strokeWidth={2} aria-hidden="true" />
    </Button>
  );
}
