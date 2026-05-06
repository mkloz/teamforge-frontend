import { Bell } from "lucide-react";

import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useNotificationsDrawerState } from "@/features/notifications/hooks/use-notifications-drawer-state";
import { Button } from "@/shared/components/ui/button";

export function HomeHeroNotificationButton() {
  const { count: unreadNotifications } = useNotifications();
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
      <Bell className="size-[18px]" aria-hidden="true" />
      {unreadNotifications > 0 ? (
        <span
          className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-spark-amber px-1 text-[10px] font-black text-ink"
          aria-hidden="true"
        >
          {unreadNotifications}
        </span>
      ) : null}
    </Button>
  );
}
