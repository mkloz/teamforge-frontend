import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useState } from "react";
import type { Notification } from "@/shared/schemas";
import { resolveNotificationDestination } from "@/features/notifications/lib/notification-destination";

import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { NotificationItem } from "./notification-item";

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
          "bg-card border-border",
          isDesktop
            ? "lg:w-96 lg:rounded-none lg:border-l"
            : "max-lg:rounded-t-3xl max-lg:border-t max-lg:max-h-[78vh]",
        )}
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>Notifications</DrawerTitle>
        </DrawerHeader>

        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
          <h2 className="font-bold text-lg text-ink tracking-tight">
            Notifications
          </h2>
          <div className="flex items-center gap-1.5">
            <Button
              variant="link"
              size="sm"
              onClick={markAllRead}
              disabled={items.length === 0 || isMarkingAllRead}
              className="text-[12px] text-forge-teal hover:text-forge-teal/80 font-bold h-auto p-0"
            >
              {isMarkingAllRead ? "Marking..." : "Mark all read"}
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              aria-label="Close notifications"
              className="text-slate-muted hover:text-ink rounded-lg p-0"
            >
              <X size={20} strokeWidth={2.5} aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16 px-4">
              No notifications yet.
            </p>
          ) : (
            <>
              {today.length > 0 && (
                <section aria-label="Today's notifications">
                  <div className="px-6 py-4 sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/50 z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-muted/60">
                      Today
                    </p>
                  </div>
                  {today.map((n) => (
                    <NotificationItem
                      key={n.id}
                      item={n}
                      onSelect={handleSelectNotification}
                      isPending={pendingNotificationId === n.id}
                    />
                  ))}
                </section>
              )}
              {earlier.length > 0 && (
                <section aria-label="Earlier notifications">
                  <div className="px-6 py-4 sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/50 z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-muted/60">
                      Earlier
                    </p>
                  </div>
                  {earlier.map((n) => (
                    <NotificationItem
                      key={n.id}
                      item={n}
                      onSelect={handleSelectNotification}
                      isPending={pendingNotificationId === n.id}
                    />
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
