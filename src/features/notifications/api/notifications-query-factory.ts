import { NotificationsQueryOptions } from "@/features/notifications/api/notifications-query-options";

export const NotificationsQueryFactory = {
  list: NotificationsQueryOptions.list,
  unreadList: NotificationsQueryOptions.unreadList,
  unreadCount: NotificationsQueryOptions.unreadCount,
};
