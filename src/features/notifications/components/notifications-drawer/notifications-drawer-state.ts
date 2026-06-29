export type PendingDetailAction = "mark-read" | "mark-unread" | "open";

export interface NotificationsDrawerState {
  markAllReadDialogOpen: boolean;
  pendingDetailAction: PendingDetailAction | null;
  pendingNotificationId: string | null;
  pendingReadToggleNotificationId: string | null;
  selectedNotificationId: string | null;
}

export type NotificationsDrawerAction =
  | { type: "back-to-list" }
  | { type: "clear-detail-action" }
  | { type: "clear-read-toggle" }
  | { notificationId: string; type: "select-notification" }
  | {
      action: PendingDetailAction;
      notificationId: string;
      type: "start-detail-action";
    }
  | { notificationId: string; type: "start-read-toggle" }
  | { open: boolean; type: "set-mark-all-read-dialog-open" };

export const INITIAL_NOTIFICATIONS_DRAWER_STATE: NotificationsDrawerState = {
  markAllReadDialogOpen: false,
  pendingDetailAction: null,
  pendingNotificationId: null,
  pendingReadToggleNotificationId: null,
  selectedNotificationId: null,
};

type DrawerActionHandler = (
  state: NotificationsDrawerState,
  action: NotificationsDrawerAction,
) => NotificationsDrawerState;

const notificationsDrawerActionHandlers: Record<
  NotificationsDrawerAction["type"],
  DrawerActionHandler
> = {
  "back-to-list": (state) => ({
    ...state,
    selectedNotificationId: null,
  }),
  "clear-detail-action": (state) => ({
    ...state,
    pendingDetailAction: null,
    pendingNotificationId: null,
  }),
  "clear-read-toggle": (state) => ({
    ...state,
    pendingReadToggleNotificationId: null,
  }),
  "select-notification": (state, action) =>
    action.type === "select-notification"
      ? {
          ...state,
          selectedNotificationId: action.notificationId,
        }
      : state,
  "set-mark-all-read-dialog-open": (state, action) =>
    action.type === "set-mark-all-read-dialog-open"
      ? {
          ...state,
          markAllReadDialogOpen: action.open,
        }
      : state,
  "start-detail-action": (state, action) =>
    action.type === "start-detail-action"
      ? {
          ...state,
          pendingDetailAction: action.action,
          pendingNotificationId: action.notificationId,
        }
      : state,
  "start-read-toggle": (state, action) =>
    action.type === "start-read-toggle"
      ? {
          ...state,
          pendingReadToggleNotificationId: action.notificationId,
        }
      : state,
};

export function notificationsDrawerReducer(
  state: NotificationsDrawerState,
  action: NotificationsDrawerAction,
): NotificationsDrawerState {
  return notificationsDrawerActionHandlers[action.type](state, action);
}
