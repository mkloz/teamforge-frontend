import { Bell } from "lucide-react";

import { useUnreadNotificationCount } from "@/features/notifications/hooks/use-notifications";
import { useNotificationsDrawerState } from "@/features/notifications/hooks/use-notifications-drawer-state";
import { Button } from "@/shared/components/ui/button";

export function HomeHeroNotificationButton() {
  const { count: unreadNotifications } = useUnreadNotificationCount();
  const { openDrawer } = useNotificationsDrawerState();

  return (
    <Button
      type="button"
      variant="surface"
      size="icon"
      onClick={() => void openDrawer()}
      aria-label={
        unreadNotifications > 0
          ? `View notifications (${unreadNotifications} unread)`
          : "View notifications"
      }
      className="relative size-11 shrink-0 rounded-lg"
    >
      <Bell className="size-5" aria-hidden="true" />
      {unreadNotifications > 0 ? (
        <span
          className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-spark-amber px-1 font-black text-ink text-xs"
          aria-hidden="true"
        >
          {unreadNotifications}
        </span>
      ) : null}
    </Button>
  );
}
