import { apiClient } from "@/shared/api/api";
import { getUnreadNotificationCount } from "@/shared/api/notification-count-api";
import {
  createPaginatedSchema,
  notificationSchema,
  notificationUnreadCountSchema,
} from "@/shared/schemas";

const paginatedNotificationsSchema = createPaginatedSchema(notificationSchema);

interface GetNotificationsParams {
  isRead?: boolean;
  limit?: number;
}

export class NotificationsApi {
  static async getNotifications({
    isRead,
    limit = 50,
  }: GetNotificationsParams = {}) {
    const response = await apiClient
      .get("notifications", {
        searchParams: {
          limit,
          ...(isRead === undefined ? {} : { isRead }),
        },
      })
      .json<unknown>();

    return paginatedNotificationsSchema.parse(response).items;
  }

  static async getUnreadCount() {
    return getUnreadNotificationCount();
  }

  static async markRead(id: string) {
    const response = await apiClient
      .post(`notifications/${id}/read`)
      .json<unknown>();
    return notificationSchema.parse(response);
  }

  static async markUnread(id: string) {
    const response = await apiClient
      .post(`notifications/${id}/unread`)
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
