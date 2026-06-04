import { Bell } from "lucide-react";
import { useNotificationsDrawerState } from "@/features/notifications/hooks/use-notifications-drawer-state";
import { useUnreadNotificationCount } from "@/features/notifications/hooks/use-unread-notification-count";
import { Button } from "@/shared/components/ui/button";
import { CountBadge } from "@/shared/components/ui/count-badge";

export function HomeHeroNotificationButton() {
  const { count: unreadNotifications } = useUnreadNotificationCount();
  const { openDrawer } = useNotificationsDrawerState();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => {
        void openDrawer();
      }}
      aria-label={
        unreadNotifications > 0
          ? `View notifications (${unreadNotifications} unread)`
          : "View notifications"
      }
      className="relative size-11 shrink-0 rounded-lg"
    >
      <Bell className="size-5" aria-hidden="true" />
      {unreadNotifications > 0 ? (
        <CountBadge
          aria-hidden="true"
          count={unreadNotifications}
          max={99}
          size="md"
          tone="amber"
          className="absolute -top-1.5 -right-1.5 z-10 ring-2 ring-canvas"
        />
      ) : null}
    </Button>
  );
}
