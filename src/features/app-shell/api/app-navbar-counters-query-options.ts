import { getActivityFeedChats } from "@/shared/api/activity-feed-chat-api";
import { getUnreadNotificationCount as sharedGetUnreadNotificationCount } from "@/shared/api/notification-count-api";

const NAVBAR_CHATS_LIMIT = 100;

export async function getChatsForNavbarCounters() {
  return getActivityFeedChats(NAVBAR_CHATS_LIMIT);
}

export async function getAppNavbarUnreadNotificationCount() {
  return sharedGetUnreadNotificationCount();
}
