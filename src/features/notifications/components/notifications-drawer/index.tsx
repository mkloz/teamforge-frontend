import { useNavigate } from "@tanstack/react-router";
import { useReducer, useRef } from "react";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { resolveNotificationDestination } from "@/features/notifications/lib/destination";
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
  INITIAL_NOTIFICATIONS_DRAWER_STATE,
  notificationsDrawerReducer,
  type PendingDetailAction,
} from "./notifications-drawer-state";
import {
  NotificationsDrawerBody,
  NotificationsDrawerHeader,
} from "./notifications-drawer-view";

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

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
  const [drawerState, dispatchDrawerState] = useReducer(
    notificationsDrawerReducer,
    INITIAL_NOTIFICATIONS_DRAWER_STATE,
  );
  const {
    markAllReadDialogOpen,
    pendingDetailAction,
    pendingNotificationId,
    pendingReadToggleNotificationId,
    selectedNotificationId,
  } = drawerState;
  const selectedNotification = getSelectedNotification(
    items,
    selectedNotificationId,
  );

  useResetScrollOnChange({
    enabled: open,
    ref: scrollRef,
    resetKey: `${open ? "open" : "closed"}:${selectedNotificationId ?? "list"}`,
  });

  function handleSelectNotification(notification: Notification) {
    dispatchDrawerState({
      notificationId: notification.id,
      type: "select-notification",
    });
  }

  async function handleOpenNotification(notification: Notification) {
    dispatchDrawerState({
      action: "open",
      notificationId: notification.id,
      type: "start-detail-action",
    });

    try {
      await markNotificationReadBeforeOpen(
        notification,
        isOnline,
        markReadAsync,
      );

      const destination = await resolveNotificationDestination(notification);

      onClose();
      await navigate(destination);
      dispatchDrawerState({ type: "clear-detail-action" });
    } catch (error) {
      dispatchDrawerState({ type: "clear-detail-action" });
      throw error;
    }
  }

  async function handleToggleNotificationRead(notification: Notification) {
    dispatchDrawerState({
      notificationId: notification.id,
      type: "start-read-toggle",
    });

    await toggleNotificationRead(
      notification,
      markReadAsync,
      markUnreadAsync,
    ).finally(() => {
      dispatchDrawerState({ type: "clear-read-toggle" });
    });
  }

  async function handleToggleSelectedNotificationRead(
    notification: Notification,
  ) {
    dispatchDrawerState({
      action: getNotificationReadToggleAction(notification),
      notificationId: notification.id,
      type: "start-detail-action",
    });

    await toggleNotificationRead(
      notification,
      markReadAsync,
      markUnreadAsync,
    ).finally(() => {
      dispatchDrawerState({ type: "clear-detail-action" });
    });
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
          onMarkAllReadDialogOpenChange={(nextOpen) =>
            dispatchDrawerState({
              open: nextOpen,
              type: "set-mark-all-read-dialog-open",
            })
          }
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
            onBackToList={() => dispatchDrawerState({ type: "back-to-list" })}
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
