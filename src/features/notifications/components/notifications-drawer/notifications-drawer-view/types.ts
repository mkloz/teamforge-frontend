import type { useNotifications } from "@/features/notifications/hooks/use-notifications";
import type { Notification } from "@/shared/schemas";

export type NotificationGroup = ReturnType<
  typeof useNotifications
>["notificationGroups"][number];

export type PendingDetailAction = "mark-read" | "mark-unread" | "open" | null;
export type ReadToggleDetailAction = Extract<
  PendingDetailAction,
  "mark-read" | "mark-unread"
>;

export interface NotificationsDrawerHeaderProps {
  count: number;
  isMarkingAllRead: boolean;
  isOnline: boolean;
  isRefreshing: boolean;
  markAllReadDialogOpen: boolean;
  selectedNotification: Notification | null;
  onClose: () => void;
  onMarkAllRead: () => unknown;
  onMarkAllReadDialogOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export interface NotificationsDrawerBodyProps {
  isLoading: boolean;
  isOnline: boolean;
  items: Notification[];
  notificationGroups: NotificationGroup[];
  pendingDetailAction: PendingDetailAction;
  pendingNotificationId: string | null;
  pendingReadToggleNotificationId: string | null;
  selectedNotification: Notification | null;
  onBackToList: () => void;
  onOpenNotification: (notification: Notification) => void;
  onSelectNotification: (notification: Notification) => void;
  onToggleNotificationRead: (notification: Notification) => void;
  onToggleSelectedNotificationRead: (notification: Notification) => void;
}
