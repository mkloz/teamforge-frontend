import type { NotificationsDrawerHeaderProps } from "./types";

export function getNotificationsDrawerHeaderState({
  count,
  selectedNotification,
}: Pick<NotificationsDrawerHeaderProps, "count" | "selectedNotification">) {
  return {
    containerClassName: selectedNotification
      ? "min-h-15 pb-2"
      : "min-h-20 border-border/70 border-b pb-4",
    countLabel: selectedNotification
      ? "Notification detail"
      : getUnreadCountLabel(count),
    showListActions: !selectedNotification,
  };
}

function getUnreadCountLabel(count: number) {
  if (count === 0) {
    return "All caught up";
  }

  return `${count} unread`;
}

export function getNotificationsListHeaderActionLabels(isOnline: boolean) {
  if (!isOnline) {
    return {
      markAllRead: "Reconnect to mark all notifications as read",
      refresh: "Reconnect to refresh",
    };
  }

  return {
    markAllRead: "Mark all notifications as read",
    refresh: "Refresh notifications",
  };
}
