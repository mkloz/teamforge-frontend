import { apiClient } from "@/shared/api/api";
import {
  chatApiSchema,
  createPaginatedSchema,
  notificationUnreadCountSchema,
} from "@/shared/schemas";

const navbarChatsSchema = createPaginatedSchema(chatApiSchema);
const NAVBAR_CHATS_LIMIT = 100;

export async function getChatsForNavbarCounters() {
  const response = await apiClient
    .get("chats/activity-feed", {
      searchParams: {
        limit: String(NAVBAR_CHATS_LIMIT),
      },
    })
    .json<unknown>();

  return navbarChatsSchema.parse(response).items;
}

export async function getUnreadNotificationCount() {
  const response = await apiClient
    .get("notifications/unread-count")
    .json<unknown>();

  return notificationUnreadCountSchema.parse(response).unreadCount;
}
