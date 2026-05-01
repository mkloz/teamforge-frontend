import { AppLayout } from "@/features/app-shell/app-layout";
import { NotificationsBellTrigger } from "@/features/notifications/components/notifications-bell-trigger";
import { NotificationsDrawer } from "@/features/notifications/components/notifications-drawer";
import { useNotificationsDrawerState } from "@/features/notifications/hooks/use-notifications-drawer-state";

export function AppShellWithNotifications() {
  const { open, openDrawer, closeDrawer } = useNotificationsDrawerState();

  return (
    <AppLayout
      notificationTrigger={
        <NotificationsBellTrigger onClick={() => void openDrawer()} />
      }
      notificationDrawer={
        <NotificationsDrawer open={open} onClose={() => void closeDrawer()} />
      }
    />
  );
}
