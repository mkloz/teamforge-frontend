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
      variant="outline"
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
          className="absolute -top-1.5 -right-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full border border-spark-amber/40 bg-canvas px-1 font-black text-spark-amber text-xs shadow-[inset_0_0_0_999px_color-mix(in_srgb,var(--color-spark-amber)_16%,transparent)] ring-2 ring-canvas"
          aria-hidden="true"
        >
          {unreadNotifications}
        </span>
      ) : null}
    </Button>
  );
}
