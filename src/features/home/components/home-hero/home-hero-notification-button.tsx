import { Bell } from "lucide-react";
import { useNotificationCountEnabled } from "@/features/notifications/hooks/use-notification-count-enabled";
import { useNotificationsDrawerState } from "@/features/notifications/hooks/use-notifications-drawer-state";
import { useUnreadNotificationCount } from "@/features/notifications/hooks/use-unread-notification-count";
import { Button } from "@/shared/components/ui/button";

export function HomeHeroNotificationButton() {
  const [countEnabled, enableCount] = useNotificationCountEnabled();
  const { count: unreadNotifications } = useUnreadNotificationCount({
    enabled: countEnabled,
  });
  const { openDrawer } = useNotificationsDrawerState();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onPointerEnter={enableCount}
      onPointerDown={enableCount}
      onFocus={enableCount}
      onClick={() => {
        enableCount();
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
