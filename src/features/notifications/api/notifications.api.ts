import { apiClient } from "@/shared/api/api";
import {
  createPaginatedSchema,
  notificationSchema,
  notificationUnreadCountSchema,
} from "@/shared/schemas";

const paginatedNotificationsSchema = createPaginatedSchema(notificationSchema);

export class NotificationsApi {
  static async getNotifications() {
    const response = await apiClient
      .get("notifications", {
        searchParams: {
          limit: 50,
        },
      })
      .json<unknown>();

    return paginatedNotificationsSchema.parse(response).items;
  }

  static async getUnreadCount() {
    const response = await apiClient
      .get("notifications/unread-count")
      .json<unknown>();

    return notificationUnreadCountSchema.parse(response).unreadCount;
  }

  static async markRead(id: string) {
    const response = await apiClient
      .post(`notifications/${id}/read`)
      .json<unknown>();
    return notificationSchema.parse(response);
  }

  static async markAllRead() {
    const response = await apiClient
      .post("notifications/read-all")
      .json<unknown>();

    return notificationUnreadCountSchema.parse(response);
  }
}
