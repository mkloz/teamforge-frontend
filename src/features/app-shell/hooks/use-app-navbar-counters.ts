import { useQuery } from "@tanstack/react-query";
import { AppNavbarCountersQueryOptions } from "@/features/app-shell/api/app-navbar-counters-query-options";
import type { ChatApi } from "@/shared/schemas";

export interface AppNavbarCounters {
  activityUnreadCount: number;
  notificationUnreadCount: number;
}

export function useAppNavbarCounters(): AppNavbarCounters {
  const chatsQuery = useQuery(AppNavbarCountersQueryOptions.chats());
  const notificationUnreadCountQuery = useQuery(
    AppNavbarCountersQueryOptions.notificationUnreadCount(),
  );

  return {
    activityUnreadCount: countUnreadChatMessages(chatsQuery.data ?? []),
    notificationUnreadCount: notificationUnreadCountQuery.data ?? 0,
  };
}

function countUnreadChatMessages(chats: ChatApi[]) {
  return chats.reduce((total, chat) => {
    if (chat.isMuted) {
      return total;
    }

    return total + Math.max(0, chat.unreadCount ?? (chat.hasUnread ? 1 : 0));
  }, 0);
}
