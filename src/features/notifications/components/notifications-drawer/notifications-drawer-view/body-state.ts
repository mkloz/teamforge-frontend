import type { Notification } from "@/shared/schemas";
import type { PendingDetailAction, ReadToggleDetailAction } from "./types";

const READ_TOGGLE_DETAIL_ACTIONS = new Set<PendingDetailAction>([
  "mark-read",
  "mark-unread",
]);

export function isSelectedNotificationReadTogglePending({
  pendingDetailAction,
  pendingNotificationId,
  selectedNotification,
}: {
  pendingDetailAction: PendingDetailAction;
  pendingNotificationId: string | null;
  selectedNotification: Notification;
}) {
  return (
    pendingNotificationId === selectedNotification.id &&
    isReadToggleDetailAction(pendingDetailAction)
  );
}

export function isSelectedNotificationOpenPending({
  pendingDetailAction,
  pendingNotificationId,
  selectedNotification,
}: {
  pendingDetailAction: PendingDetailAction;
  pendingNotificationId: string | null;
  selectedNotification: Notification;
}) {
  return (
    pendingNotificationId === selectedNotification.id &&
    pendingDetailAction === "open"
  );
}

function isReadToggleDetailAction(
  pendingDetailAction: PendingDetailAction,
): pendingDetailAction is ReadToggleDetailAction {
  return READ_TOGGLE_DETAIL_ACTIONS.has(pendingDetailAction);
}

export function getListPendingNotificationId({
  pendingDetailAction,
  pendingNotificationId,
}: {
  pendingDetailAction: PendingDetailAction;
  pendingNotificationId: string | null;
}) {
  return pendingDetailAction ? pendingNotificationId : null;
}
