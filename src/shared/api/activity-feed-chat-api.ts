import { apiClient } from "@/shared/api/api";
import { chatApiSchema, createPaginatedSchema } from "@/shared/schemas";

type ActivityFeedChatLimit = number | string;

const paginatedActivityFeedChatsSchema = createPaginatedSchema(chatApiSchema);

export async function getActivityFeedChats(limit: ActivityFeedChatLimit) {
  const response = await apiClient
    .get("chats/activity-feed", {
      searchParams: {
        limit: String(limit),
      },
    })
    .json<unknown>();

  return paginatedActivityFeedChatsSchema.parse(response).items;
}
