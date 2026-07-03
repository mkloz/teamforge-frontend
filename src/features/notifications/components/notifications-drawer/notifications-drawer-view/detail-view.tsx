import { NotificationDetail } from "../notification-detail";
import {
  isSelectedNotificationOpenPending,
  isSelectedNotificationReadTogglePending,
} from "./body-state";
import type { NotificationsDrawerBodyProps } from "./types";

type NotificationsDetailViewProps = Pick<
  NotificationsDrawerBodyProps,
  | "isOnline"
  | "pendingDetailAction"
  | "pendingNotificationId"
  | "selectedNotification"
  | "onBackToList"
  | "onOpenNotification"
  | "onToggleSelectedNotificationRead"
> & {
  selectedNotification: NonNullable<
    NotificationsDrawerBodyProps["selectedNotification"]
  >;
};

export function NotificationsDetailView({
  isOnline,
  pendingDetailAction,
  pendingNotificationId,
  selectedNotification,
  onBackToList,
  onOpenNotification,
  onToggleSelectedNotificationRead,
}: NotificationsDetailViewProps) {
  return (
    <NotificationDetail
      item={selectedNotification}
      isTogglingRead={isSelectedNotificationReadTogglePending({
        pendingDetailAction,
        pendingNotificationId,
        selectedNotification,
      })}
      isOpening={isSelectedNotificationOpenPending({
        pendingDetailAction,
        pendingNotificationId,
        selectedNotification,
      })}
      isReadActionDisabled={!isOnline}
      onBack={onBackToList}
      onToggleRead={onToggleSelectedNotificationRead}
      onOpen={onOpenNotification}
    />
  );
}
