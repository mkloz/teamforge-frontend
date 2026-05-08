import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { resolveNotificationDestination } from "@/features/notifications/lib/notification-destination";
import { Button } from "@/shared/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";
import { NotificationsSection } from "./notifications-section";

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({
  open,
  onClose,
}: NotificationsDrawerProps) {
  const {
    items,
    today,
    earlier,
    markReadAsync,
    markAllRead,
    isMarkingAllRead,
  } = useNotifications();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const navigate = useNavigate();
  const [pendingNotificationId, setPendingNotificationId] = useState<
    string | null
  >(null);

  async function handleSelectNotification(notification: Notification) {
    setPendingNotificationId(notification.id);

    try {
      await markReadAsync(notification.id);
      const destination = await resolveNotificationDestination(notification);

      onClose();
      await navigate(destination);
    } finally {
      setPendingNotificationId(null);
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      direction={isDesktop ? "right" : "bottom"}
    >
      <DrawerContent
        className={cn(
          "border-border bg-card",
          isDesktop
            ? "lg:w-96 lg:rounded-l-xl lg:border-l"
            : "max-lg:max-h-[78vh] max-lg:rounded-t-xl max-lg:border-t",
        )}
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>Notifications</DrawerTitle>
        </DrawerHeader>

        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            Notifications
          </h2>
          <div className="flex items-center gap-1.5">
            <Button
              variant="link"
              size="sm"
              onClick={markAllRead}
              disabled={items.length === 0 || isMarkingAllRead}
              className="h-auto p-0 text-xs font-bold"
            >
              {isMarkingAllRead ? "Marking..." : "Mark all read"}
            </Button>
            <Button
              variant="accentGhost"
              size="icon-xs"
              onClick={onClose}
              aria-label="Close notifications"
              className="p-0"
            >
              <X size={20} strokeWidth={2.5} aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <p className="px-4 py-16 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <>
              <NotificationsSection
                label="Today"
                items={today}
                pendingNotificationId={pendingNotificationId}
                onSelect={handleSelectNotification}
              />
              <NotificationsSection
                label="Earlier"
                items={earlier}
                pendingNotificationId={pendingNotificationId}
                onSelect={handleSelectNotification}
              />
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
