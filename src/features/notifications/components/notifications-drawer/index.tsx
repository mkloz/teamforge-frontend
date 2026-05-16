import { useNavigate } from "@tanstack/react-router";
import { CheckCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";
import { NotificationDetail } from "./notification-detail";
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
    notificationGroups,
    markReadAsync,
    markAllRead,
    isLoading,
    isMarkingAllRead,
    count,
  } = useNotifications();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [pendingNotificationId, setPendingNotificationId] = useState<
    string | null
  >(null);
  const [pendingDetailAction, setPendingDetailAction] = useState<
    "mark-read" | "open" | null
  >(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const selectedNotification =
    items.find((item) => item.id === selectedNotificationId) ?? null;

  useResetScrollOnChange({
    enabled: open,
    ref: scrollRef,
    resetKey: `${open ? "open" : "closed"}:${selectedNotificationId ?? "list"}`,
  });

  useEffect(() => {
    if (!open) {
      setPendingNotificationId(null);
      setPendingDetailAction(null);
      setSelectedNotificationId(null);
    }
  }, [open]);

  function handleSelectNotification(notification: Notification) {
    setSelectedNotificationId(notification.id);
  }

  async function handleOpenNotification(notification: Notification) {
    setPendingNotificationId(notification.id);
    setPendingDetailAction("open");

    try {
      if (!notification.isRead) {
        await markReadAsync(notification.id);
      }

      const destination = await resolveNotificationDestination(notification);

      onClose();
      await navigate(destination);
      setPendingNotificationId(null);
      setPendingDetailAction(null);
    } catch (error) {
      setPendingNotificationId(null);
      setPendingDetailAction(null);
      throw error;
    }
  }

  async function handleMarkNotificationRead(notification: Notification) {
    if (notification.isRead) {
      return;
    }

    setPendingNotificationId(notification.id);
    setPendingDetailAction("mark-read");

    try {
      await markReadAsync(notification.id);
      setPendingNotificationId(null);
      setPendingDetailAction(null);
    } catch (error) {
      setPendingNotificationId(null);
      setPendingDetailAction(null);
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
          "border-border bg-canvas text-ink shadow-none",
          isDesktop
            ? "lg:w-96 lg:rounded-l-2xl lg:border-l"
            : "max-lg:max-h-screen max-lg:rounded-t-2xl max-lg:border-t",
        )}
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>Notifications</DrawerTitle>
        </DrawerHeader>

        {/* Header */}
        <div className="flex min-h-18 shrink-0 flex-wrap items-center justify-between gap-3 border-border border-b px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-ink text-lg leading-tight tracking-tight">
              Notifications
            </h2>
            <p className="mt-1 text-slate-muted text-xs">
              {count > 0
                ? `${count} unread ${count === 1 ? "update" : "updates"}`
                : "All caught up"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="subtle"
              size="sm"
              onClick={markAllRead}
              disabled={count === 0 || isMarkingAllRead}
              className="px-3"
              contentClassName="gap-1.5"
            >
              <CheckCheck className="size-3.5 shrink-0" aria-hidden="true" />
              {isMarkingAllRead ? "Marking..." : "Mark all read"}
            </Button>
            <Button
              variant="accentGhost"
              size="icon"
              onClick={onClose}
              aria-label="Close notifications"
              className="size-10 p-0"
            >
              <X
                className="size-5 shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
            </Button>
          </div>
        </div>

        {/* Scrollable list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          {isLoading ? (
            <NotificationsDrawerSkeleton />
          ) : items.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-6 py-14 text-center sm:py-16">
              <EmptyNotificationsVisual className="h-30 w-auto text-foreground" />
              <div className="mt-6 max-w-68">
                <p className="font-bold text-base text-ink leading-tight">
                  Nothing needs your attention
                </p>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  We'll keep this quiet until there's something useful to check.
                </p>
              </div>
            </div>
          ) : selectedNotification ? (
            <NotificationDetail
              item={selectedNotification}
              isMarkingRead={
                pendingNotificationId === selectedNotification.id &&
                pendingDetailAction === "mark-read"
              }
              isOpening={
                pendingNotificationId === selectedNotification.id &&
                pendingDetailAction === "open"
              }
              onBack={() => setSelectedNotificationId(null)}
              onMarkRead={handleMarkNotificationRead}
              onOpen={handleOpenNotification}
            />
          ) : (
            notificationGroups.map((group) => (
              <NotificationsSection
                key={group.key}
                label={group.label}
                items={group.items}
                pendingNotificationId={
                  pendingDetailAction ? pendingNotificationId : null
                }
                onSelect={handleSelectNotification}
              />
            ))
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
    <div>
      <span className="sr-only">Loading notifications</span>
      <div className="sticky top-0 z-10 border-border/60 border-b bg-canvas px-5 py-3">
        <LoadingBlock className="h-3 w-16 rounded-md" />
      </div>
      <div className="divide-y divide-border/55">
        {NOTIFICATION_SKELETON_ROWS.map((row, index) => (
          <div
            className="flex w-full items-start gap-3 px-5 py-4 text-left"
            key={row}
          >
            <LoadingBlock
              className={cn(
                "mt-0.5 size-10 shrink-0 rounded-xl",
                index === 0 ? "bg-spark-amber/18" : "bg-forge-teal/12",
              )}
            />
            <div className="min-w-0 flex-1 flex-col gap-0.5">
              <LoadingBlock className="h-3.5 w-32 rounded-md" />
              <LoadingBlock className="h-3 w-full rounded-md" />
              <LoadingBlock
                className={cn(
                  "mt-1.5 h-3 rounded-md",
                  index % 2 === 0 ? "w-3/4" : "w-1/2",
                )}
              />
              <div className="mt-2 flex items-center gap-2">
                <LoadingBlock className="h-2.5 w-12 rounded-md" />
                {index === 0 ? (
                  <LoadingBlock className="size-2 rounded-full bg-forge-teal/35" />
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
