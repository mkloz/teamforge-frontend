import { NotificationsRealtimeHandlers } from "@/features/notifications/api/notifications-realtime-handlers";
import type { Notification } from "@/shared/schemas";

export function addIncomingNotification(notification: Notification) {
  NotificationsRealtimeHandlers.addIncomingNotification(notification);
}
