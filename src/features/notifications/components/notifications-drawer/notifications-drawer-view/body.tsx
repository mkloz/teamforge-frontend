import { NotificationsDrawerSkeleton } from "../notifications-drawer-skeleton";
import { NotificationsDetailView } from "./detail-view";
import { NotificationsEmptyState } from "./empty-state";
import { NotificationsListView } from "./list-view";
import type { NotificationsDrawerBodyProps } from "./types";

export function NotificationsDrawerBody({
  isLoading,
  isOnline,
  items,
  notificationGroups,
  pendingDetailAction,
  pendingNotificationId,
  pendingReadToggleNotificationId,
  selectedNotification,
  onBackToList,
  onOpenNotification,
  onSelectNotification,
  onToggleNotificationRead,
  onToggleSelectedNotificationRead,
}: NotificationsDrawerBodyProps) {
  if (isLoading) {
    return <NotificationsDrawerSkeleton />;
  }

  if (items.length === 0) {
    return <NotificationsEmptyState />;
  }

  if (selectedNotification) {
    return (
      <NotificationsDetailView
        isOnline={isOnline}
        pendingDetailAction={pendingDetailAction}
        pendingNotificationId={pendingNotificationId}
        selectedNotification={selectedNotification}
        onBackToList={onBackToList}
        onOpenNotification={onOpenNotification}
        onToggleSelectedNotificationRead={onToggleSelectedNotificationRead}
      />
    );
  }

  return (
    <NotificationsListView
      isOnline={isOnline}
      notificationGroups={notificationGroups}
      pendingDetailAction={pendingDetailAction}
      pendingNotificationId={pendingNotificationId}
      pendingReadToggleNotificationId={pendingReadToggleNotificationId}
      onSelectNotification={onSelectNotification}
      onToggleNotificationRead={onToggleNotificationRead}
    />
  );
}
