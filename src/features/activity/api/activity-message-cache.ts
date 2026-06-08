import { syncChatLastMessageFromMessagesCache } from "@/features/activity/api/messages/message-cache-chat-sync";
import {
  insertCachedMessage,
  removeCachedMessage,
  replaceCachedMessage,
  updateCachedMessageStatus,
} from "@/features/activity/api/messages/message-cache-page-mutations";
import {
  getMessageCaches,
  updateMessagesCache,
} from "@/features/activity/api/messages/message-cache-primitives";
import {
  getLatestCachedMessage,
  getMessages,
} from "@/features/activity/api/messages/message-cache-readers";

export {
  type ActivityMessagesInfiniteData,
  type ActivityMessagesPageData,
  DEFAULT_ACTIVITY_MESSAGE_LIMIT,
} from "@/features/activity/api/messages/message-cache-types";
export {
  flattenMessagePages,
  toMessageApi,
} from "@/features/activity/api/messages/message-mappers";
export {
  getMessageVersion,
  mergePinnedApiMessages,
  pickNewerApiMessage,
  shouldReplaceApiMessage,
  shouldReplaceMessage,
} from "@/features/activity/api/messages/message-versioning";
export { findMatchingOptimisticMessage } from "@/features/activity/api/messages/optimistic-message-match";

export const ActivityMessageCache = {
  getLatestCachedMessage,
  getMessageCaches,
  getMessages,
  insert: insertCachedMessage,
  remove: removeCachedMessage,
  replace: replaceCachedMessage,
  syncChatLastMessageFromMessagesCache,
  updateMessagesCache,
  updateStatus: updateCachedMessageStatus,
};
