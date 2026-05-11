import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { EmptyNotificationsVisual } from "@/assets/empty-state/empty-notifications";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { resolveNotificationDestination } from "@/features/notifications/lib/notification-destination";
import { LoadingBlock } from "@/shared/components/loading/loading-block";
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
    isLoading,
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
      setPendingNotificationId(null);
    } catch (error) {
      setPendingNotificationId(null);
      throw error;
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
            : "max-lg:max-h-screen max-lg:rounded-t-xl max-lg:border-t",
        )}
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>Notifications</DrawerTitle>
        </DrawerHeader>

        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-border border-b px-6">
          <h2 className="font-bold text-ink text-lg tracking-tight">
            Notifications
          </h2>
          <div className="flex items-center gap-1.5">
            <Button
              variant="link"
              size="sm"
              onClick={markAllRead}
              disabled={items.length === 0 || isMarkingAllRead}
              className="h-auto p-0 font-bold text-xs"
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
          {isLoading ? (
            <NotificationsDrawerSkeleton />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center sm:py-16">
              <EmptyNotificationsVisual className="w-36 text-foreground" />
              <div className="mt-6 max-w-64">
                <p className="font-bold text-base text-foreground leading-tight">
                  You're all caught up.
                </p>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  Invites, replies, and group updates will show up here when
                  there's something to act on.
                </p>
              </div>
            </div>
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

const NOTIFICATION_SKELETON_ROWS = [
  "invite",
  "reply",
  "plan",
  "group",
] as const;

function NotificationsDrawerSkeleton() {
  return (
    <div className="px-6 py-5">
      <span className="sr-only">Loading notifications</span>
      <LoadingBlock className="mb-4 h-3 w-16 rounded-md" />
      <div className="flex flex-col gap-3">
        {NOTIFICATION_SKELETON_ROWS.map((row, index) => (
          <div
            className="flex gap-3 border-border/45 border-b pb-3 last:border-b-0"
            key={row}
          >
            <LoadingBlock className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center justify-between gap-3">
                <LoadingBlock className="h-3 w-28 rounded-md" />
                <LoadingBlock className="h-2.5 w-10 rounded-md" />
              </div>
              <LoadingBlock className="h-3 w-full rounded-md" />
              <LoadingBlock
                className={cn(
                  "mt-2 h-3 rounded-md",
                  index % 2 === 0 ? "w-3/4" : "w-1/2",
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
