import { NotificationsQueryOptions } from "@/features/notifications/api/notifications-query-options";

export const NotificationsQueryFactory = {
  list: (...args: Parameters<typeof NotificationsQueryOptions.list>) =>
    NotificationsQueryOptions.list(...args),
  unreadList: (
    ...args: Parameters<typeof NotificationsQueryOptions.unreadList>
  ) => NotificationsQueryOptions.unreadList(...args),
  unreadCount: (
    ...args: Parameters<typeof NotificationsQueryOptions.unreadCount>
  ) => NotificationsQueryOptions.unreadCount(...args),
};
