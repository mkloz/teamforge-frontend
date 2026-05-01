import { NotificationsApi } from "@/features/notifications/api/notifications.api";

export const NotificationsCommands = {
  markRead(id: string) {
    return NotificationsApi.markRead(id);
  },

  markAllRead() {
    return NotificationsApi.markAllRead();
  },
};
