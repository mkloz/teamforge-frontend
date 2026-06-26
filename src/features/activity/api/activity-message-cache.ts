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
