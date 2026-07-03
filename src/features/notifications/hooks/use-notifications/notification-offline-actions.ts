export const NOTIFICATION_OFFLINE_ACTIONS = {
  markAllRead: {
    id: "notifications-mark-all-read-offline",
    description: "Reconnect before clearing notification badges.",
  },
  markRead: {
    id: "notifications-mark-read-offline",
    description: "Reconnect before marking notifications as read.",
  },
  markUnread: {
    id: "notifications-mark-unread-offline",
    description: "Reconnect before marking notifications as unread.",
  },
} as const;

export type NotificationOfflineAction =
  (typeof NOTIFICATION_OFFLINE_ACTIONS)[keyof typeof NOTIFICATION_OFFLINE_ACTIONS];
