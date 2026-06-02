import { useNavigate } from "@tanstack/react-router";
import { CheckCheck, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmptyNotificationsVisual } from "@/assets/empty-state/empty-notifications";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { resolveNotificationDestination } from "@/features/notifications/lib/notification-destination";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";
import { NotificationDetail } from "./notification-detail";
import { NotificationsDrawerSkeleton } from "./notifications-drawer-skeleton";
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
    markUnreadAsync,
    markAllReadAsync,
    refreshNotifications,
    isLoading,
    isRefreshing,
    isMarkingAllRead,
    count,
    isOnline,
  } = useNotifications({ enabled: open });
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [pendingNotificationId, setPendingNotificationId] = useState<
    string | null
  >(null);
  const [pendingDetailAction, setPendingDetailAction] = useState<
    "mark-read" | "mark-unread" | "open" | null
  >(null);
  const [pendingReadToggleNotificationId, setPendingReadToggleNotificationId] =
    useState<string | null>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const [markAllReadDialogOpen, setMarkAllReadDialogOpen] = useState(false);
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
      setPendingReadToggleNotificationId(null);
      setSelectedNotificationId(null);
      setMarkAllReadDialogOpen(false);
    }
  }, [open]);

  function handleSelectNotification(notification: Notification) {
    setSelectedNotificationId(notification.id);
  }

  async function handleOpenNotification(notification: Notification) {
    setPendingNotificationId(notification.id);
    setPendingDetailAction("open");

    try {
      if (!notification.isRead && isOnline) {
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

  async function handleToggleNotificationRead(notification: Notification) {
    setPendingReadToggleNotificationId(notification.id);

    try {
      if (notification.isRead) {
        await markUnreadAsync(notification.id);
      } else {
        await markReadAsync(notification.id);
      }
    } finally {
      setPendingReadToggleNotificationId(null);
    }
  }

  async function handleToggleSelectedNotificationRead(
    notification: Notification,
  ) {
    setPendingNotificationId(notification.id);
    setPendingDetailAction(notification.isRead ? "mark-unread" : "mark-read");

    try {
      if (notification.isRead) {
        await markUnreadAsync(notification.id);
      } else {
        await markReadAsync(notification.id);
      }
    } finally {
      setPendingNotificationId(null);
      setPendingDetailAction(null);
    }
  }

  function handleRefreshNotifications() {
    void refreshNotifications();
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
        <div
          className={cn(
            "flex shrink-0 flex-wrap items-center justify-between gap-3 px-5 pt-4",
            selectedNotification
              ? "min-h-16 pb-2"
              : "min-h-18 border-border border-b pb-4",
          )}
        >
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
            {!selectedNotification ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="subtle"
                      size="icon"
                      onClick={() => setMarkAllReadDialogOpen(true)}
                      disabled={!isOnline || count === 0 || isMarkingAllRead}
                      loading={isMarkingAllRead}
                      aria-label="Mark all notifications as read"
                      className="size-10 p-0"
                    >
                      <CheckCheck
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isOnline
                      ? "Mark all notifications as read"
                      : "Reconnect to update read state"}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="accentGhost"
                      size="icon"
                      onClick={handleRefreshNotifications}
                      disabled={isRefreshing}
                      loading={isRefreshing}
                      aria-label="Refresh notifications"
                      className="size-10 p-0"
                    >
                      <RefreshCw
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Refresh notifications
                  </TooltipContent>
                </Tooltip>
              </>
            ) : null}
            <ActionDialog
              cancelLabel="Not now"
              confirmLabel={
                isMarkingAllRead ? "Marking..." : "Mark all as read"
              }
              description="This clears the unread badges from every notification in the drawer."
              details={[
                "The notifications stay in your history.",
                "New updates will still appear as unread.",
              ]}
              loading={isMarkingAllRead}
              disabled={!isOnline || count === 0}
              onConfirm={markAllReadAsync}
              onOpenChange={setMarkAllReadDialogOpen}
              open={markAllReadDialogOpen}
              title="Mark every notification as read?"
              tone="info"
            />
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
              isTogglingRead={
                pendingNotificationId === selectedNotification.id &&
                (pendingDetailAction === "mark-read" ||
                  pendingDetailAction === "mark-unread")
              }
              isOpening={
                pendingNotificationId === selectedNotification.id &&
                pendingDetailAction === "open"
              }
              isReadActionDisabled={!isOnline}
              onBack={() => setSelectedNotificationId(null)}
              onToggleRead={handleToggleSelectedNotificationRead}
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
                pendingReadToggleNotificationId={
                  pendingReadToggleNotificationId
                }
                isReadActionDisabled={!isOnline}
                onSelect={handleSelectNotification}
                onToggleRead={handleToggleNotificationRead}
              />
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
