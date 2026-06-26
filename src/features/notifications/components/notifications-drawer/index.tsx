import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { resolveNotificationDestination } from "@/features/notifications/lib/notification-destination";
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
import {
  NotificationsDrawerBody,
  NotificationsDrawerHeader,
} from "./notifications-drawer-view";

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

type PendingDetailAction = "mark-read" | "mark-unread" | "open";
type NotificationReadMutation = (id: string) => Promise<unknown>;

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
  const [pendingDetailAction, setPendingDetailAction] =
    useState<PendingDetailAction | null>(null);
  const [pendingReadToggleNotificationId, setPendingReadToggleNotificationId] =
    useState<string | null>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const [markAllReadDialogOpen, setMarkAllReadDialogOpen] = useState(false);
  const selectedNotification = getSelectedNotification(
    items,
    selectedNotificationId,
  );

  useResetScrollOnChange({
    enabled: open,
    ref: scrollRef,
    resetKey: `${open ? "open" : "closed"}:${selectedNotificationId ?? "list"}`,
  });

  useEffect(() => {
    if (!open) {
      resetNotificationsDrawerState({
        setMarkAllReadDialogOpen,
        setPendingDetailAction,
        setPendingNotificationId,
        setPendingReadToggleNotificationId,
        setSelectedNotificationId,
      });
    }
  }, [open]);

  function handleSelectNotification(notification: Notification) {
    setSelectedNotificationId(notification.id);
  }

  async function handleOpenNotification(notification: Notification) {
    setPendingNotificationId(notification.id);
    setPendingDetailAction("open");

    try {
      await markNotificationReadBeforeOpen(
        notification,
        isOnline,
        markReadAsync,
      );

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
      await toggleNotificationRead(
        notification,
        markReadAsync,
        markUnreadAsync,
      );
    } finally {
      setPendingReadToggleNotificationId(null);
    }
  }

  async function handleToggleSelectedNotificationRead(
    notification: Notification,
  ) {
    setPendingNotificationId(notification.id);
    setPendingDetailAction(getNotificationReadToggleAction(notification));

    try {
      await toggleNotificationRead(
        notification,
        markReadAsync,
        markUnreadAsync,
      );
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

        <NotificationsDrawerHeader
          count={count}
          isMarkingAllRead={isMarkingAllRead}
          isOnline={isOnline}
          isRefreshing={isRefreshing}
          markAllReadDialogOpen={markAllReadDialogOpen}
          selectedNotification={selectedNotification}
          onClose={onClose}
          onMarkAllRead={markAllReadAsync}
          onMarkAllReadDialogOpenChange={setMarkAllReadDialogOpen}
          onRefresh={handleRefreshNotifications}
        />

        {/* Scrollable list */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          <NotificationsDrawerBody
            isLoading={isLoading}
            isOnline={isOnline}
            items={items}
            notificationGroups={notificationGroups}
            pendingDetailAction={pendingDetailAction}
            pendingNotificationId={pendingNotificationId}
            pendingReadToggleNotificationId={pendingReadToggleNotificationId}
            selectedNotification={selectedNotification}
            onBackToList={() => setSelectedNotificationId(null)}
            onOpenNotification={handleOpenNotification}
            onSelectNotification={handleSelectNotification}
            onToggleNotificationRead={handleToggleNotificationRead}
            onToggleSelectedNotificationRead={
              handleToggleSelectedNotificationRead
            }
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function getSelectedNotification(
  items: Notification[],
  selectedNotificationId: string | null,
) {
  return items.find((item) => item.id === selectedNotificationId) ?? null;
}

function getNotificationReadToggleAction(
  notification: Notification,
): PendingDetailAction {
  return notification.isRead ? "mark-unread" : "mark-read";
}

async function markNotificationReadBeforeOpen(
  notification: Notification,
  isOnline: boolean,
  markReadAsync: NotificationReadMutation,
) {
  if (notification.isRead || !isOnline) {
    return;
  }

  await markReadAsync(notification.id);
}

async function toggleNotificationRead(
  notification: Notification,
  markReadAsync: NotificationReadMutation,
  markUnreadAsync: NotificationReadMutation,
) {
  const mutation = notification.isRead ? markUnreadAsync : markReadAsync;

  await mutation(notification.id);
}

function resetNotificationsDrawerState({
  setMarkAllReadDialogOpen,
  setPendingDetailAction,
  setPendingNotificationId,
  setPendingReadToggleNotificationId,
  setSelectedNotificationId,
}: {
  setMarkAllReadDialogOpen: (open: boolean) => void;
  setPendingDetailAction: (action: PendingDetailAction | null) => void;
  setPendingNotificationId: (id: string | null) => void;
  setPendingReadToggleNotificationId: (id: string | null) => void;
  setSelectedNotificationId: (id: string | null) => void;
}) {
  setPendingNotificationId(null);
  setPendingDetailAction(null);
  setPendingReadToggleNotificationId(null);
  setSelectedNotificationId(null);
  setMarkAllReadDialogOpen(false);
}
