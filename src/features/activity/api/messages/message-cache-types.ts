import type { InfiniteData } from "@tanstack/react-query";

import type { MessageApi, Paginated } from "@/shared/schemas";

export const DEFAULT_ACTIVITY_MESSAGE_LIMIT = 50;

export type ActivityMessagesPageData = Paginated<MessageApi>;

export type ActivityMessagesInfiniteData = InfiniteData<
  ActivityMessagesPageData,
  unknown
>;
