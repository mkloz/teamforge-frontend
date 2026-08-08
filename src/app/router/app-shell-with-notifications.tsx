import { Bell } from "lucide-react";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/features/app-shell/public/app-layout";
import {
  NotificationsDrawerShell,
  NotificationsDrawerSkeleton,
  useNotificationsDrawerState,
} from "@/features/notifications/public/notification-drawer";
import { Button } from "@/shared/components/ui/button";

const NotificationsDrawerContent = lazy(() =>
  import("@/features/notifications/public/notification-shell").then(
    (module) => ({ default: module.NotificationsDrawerContent }),
  ),
);

const NotificationsBellTrigger = lazy(() =>
  import("@/features/notifications/public/notification-shell").then(
    (module) => ({ default: module.NotificationsBellTrigger }),
  ),
);

export function AppShellWithNotifications() {
  const { open, openDrawer, closeDrawer } = useNotificationsDrawerState();

  const openNotifications = () => {
    void openDrawer();
  };

  return (
    <AppLayout
      notificationTrigger={
        <Suspense
          fallback={<NotificationsBellFallback onClick={openNotifications} />}
        >
          <NotificationsBellTrigger onClick={openNotifications} />
        </Suspense>
      }
      notificationDrawer={
        open ? (
          <NotificationsDrawerShell
            open={open}
            onClose={() => void closeDrawer()}
          >
            <Suspense
              fallback={
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  <NotificationsDrawerSkeleton />
                </div>
              }
            >
              <NotificationsDrawerContent
                open={open}
                onClose={() => void closeDrawer()}
              />
            </Suspense>
          </NotificationsDrawerShell>
        ) : null
      }
    />
  );
}

interface NotificationsBellFallbackProps {
  onClick: () => void;
}

function NotificationsBellFallback({
  onClick,
}: NotificationsBellFallbackProps) {
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
