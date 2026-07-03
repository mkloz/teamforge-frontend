import { NotificationsSection } from "../notifications-section";
import { getListPendingNotificationId } from "./body-state";
import type { NotificationsDrawerBodyProps } from "./types";

type NotificationsListViewProps = Pick<
  NotificationsDrawerBodyProps,
  | "isOnline"
  | "notificationGroups"
  | "pendingDetailAction"
  | "pendingNotificationId"
  | "pendingReadToggleNotificationId"
  | "onSelectNotification"
  | "onToggleNotificationRead"
>;

export function NotificationsListView({
  isOnline,
  notificationGroups,
  pendingDetailAction,
  pendingNotificationId,
  pendingReadToggleNotificationId,
  onSelectNotification,
  onToggleNotificationRead,
}: NotificationsListViewProps) {
  return (
    <>
      {notificationGroups.map((group) => (
        <NotificationsSection
          key={group.key}
          label={group.label}
          items={group.items}
          pendingNotificationId={getListPendingNotificationId({
            pendingDetailAction,
            pendingNotificationId,
          })}
          pendingReadToggleNotificationId={pendingReadToggleNotificationId}
          isReadActionDisabled={!isOnline}
          onSelect={onSelectNotification}
          onToggleRead={onToggleNotificationRead}
        />
      ))}
    </>
  );
}
