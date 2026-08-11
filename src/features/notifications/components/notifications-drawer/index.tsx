import { useNavigate } from "@tanstack/react-router";
import { useReducer, useRef, useState } from "react";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { resolveNotificationDestination } from "@/features/notifications/lib/destination";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import type { Notification } from "@/shared/schemas";
import {
  getNotificationReadSuccessMessage,
  type NotificationReadAction,
  type NotificationReadFeedback,
  NotificationReadFeedbackNotice,
} from "./notification-read-feedback";
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

export function NotificationsDrawerContent({
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
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [drawerState, dispatchDrawerState] = useReducer(
    notificationsDrawerReducer,
    INITIAL_NOTIFICATIONS_DRAWER_STATE,
  );
  const [readFeedback, setReadFeedback] =
    useState<NotificationReadFeedback>(null);
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
    const action = getNotificationReadToggleAction(notification);
    dispatchDrawerState({
      notificationId: notification.id,
      type: "start-read-toggle",
    });

    await runNotificationReadChange(notification, action).finally(() => {
      dispatchDrawerState({ type: "clear-read-toggle" });
    });
  }

  async function handleToggleSelectedNotificationRead(
    notification: Notification,
  ) {
    const action = getNotificationReadToggleAction(notification);
    dispatchDrawerState({
      action,
      notificationId: notification.id,
      type: "start-detail-action",
    });

    await runNotificationReadChange(notification, action).finally(() => {
      dispatchDrawerState({ type: "clear-detail-action" });
    });
  }

  async function runNotificationReadChange(
    notification: Pick<Notification, "id" | "title">,
    action: NotificationReadAction,
  ) {
    setReadFeedback(null);

    try {
      const mutation = action === "mark-read" ? markReadAsync : markUnreadAsync;
      await mutation(notification.id);
      setReadFeedback({
        kind: "success",
        message: getNotificationReadSuccessMessage(notification.title, action),
      });
    } catch {
      setReadFeedback({
        action,
        kind: "error",
        notificationId: notification.id,
        title: notification.title,
      });
    }
  }

  async function handleRetryNotificationRead() {
    if (readFeedback?.kind !== "error") {
      return;
    }

    const failedChange = readFeedback;
    const isSelected = selectedNotificationId === failedChange.notificationId;
    dispatchDrawerState(
      isSelected
        ? {
            action: failedChange.action,
            notificationId: failedChange.notificationId,
            type: "start-detail-action",
          }
        : {
            notificationId: failedChange.notificationId,
            type: "start-read-toggle",
          },
    );

    await runNotificationReadChange(
      { id: failedChange.notificationId, title: failedChange.title },
      failedChange.action,
    ).finally(() => {
      dispatchDrawerState({
        type: isSelected ? "clear-detail-action" : "clear-read-toggle",
      });
    });
  }

  function handleRefreshNotifications() {
    void refreshNotifications();
  }

  return (
    <>
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

      <NotificationReadFeedbackNotice
        feedback={readFeedback}
        isRetrying={
          pendingReadToggleNotificationId !== null ||
          pendingDetailAction === "mark-read" ||
          pendingDetailAction === "mark-unread"
        }
        onRetry={() => void handleRetryNotificationRead()}
      />

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain pb-safe-bottom"
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
    </>
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
): Exclude<PendingDetailAction, "open"> {
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
