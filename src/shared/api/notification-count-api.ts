import { apiClient } from "@/shared/api/api";
import { notificationUnreadCountSchema } from "@/shared/schemas";

export async function getUnreadNotificationCount() {
  const response = await apiClient
    .get("notifications/unread-count")
    .json<unknown>();

  return notificationUnreadCountSchema.parse(response).unreadCount;
}
