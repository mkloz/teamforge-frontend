import { NotificationsApi } from "@/features/notifications/api/notifications.api";

export const NotificationsCommands = {
  markRead(id: string) {
    return NotificationsApi.markRead(id);
  },

  markUnread(id: string) {
    return NotificationsApi.markUnread(id);
  },

  markAllRead() {
    return NotificationsApi.markAllRead();
  },
};
