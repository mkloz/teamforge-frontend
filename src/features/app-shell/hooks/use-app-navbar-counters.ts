import { useQuery } from "@tanstack/react-query";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ChatApi } from "@/shared/schemas";

export interface AppNavbarCounters {
  activityUnreadCount: number;
  notificationUnreadCount: number;
}

const NAVBAR_COUNTERS_STALE_TIME = 30_000;

export function useAppNavbarCounters(): AppNavbarCounters {
  const chatsQuery = useQuery({
    queryKey: APP_QUERY_KEYS.activity.chats,
    queryFn: loadChatsForNavbarCounters,
    staleTime: NAVBAR_COUNTERS_STALE_TIME,
  });
  const notificationUnreadCountQuery = useQuery({
    queryKey: APP_QUERY_KEYS.notifications.unreadCount,
    queryFn: loadUnreadNotificationCount,
    staleTime: NAVBAR_COUNTERS_STALE_TIME,
  });

  return {
    activityUnreadCount: countUnreadChatMessages(chatsQuery.data ?? []),
    notificationUnreadCount: notificationUnreadCountQuery.data ?? 0,
  };
}

async function loadChatsForNavbarCounters() {
  const { getChatsForNavbarCounters } = await import(
    "@/features/app-shell/api/app-navbar-counters-query-options"
  );

  return getChatsForNavbarCounters();
}

async function loadUnreadNotificationCount() {
  const { getUnreadNotificationCount } = await import(
    "@/features/app-shell/api/app-navbar-counters-query-options"
  );

  return getUnreadNotificationCount();
}

function countUnreadChatMessages(chats: ChatApi[]) {
  return chats.reduce((total, chat) => {
    if (chat.isMuted) {
      return total;
    }

    return total + Math.max(0, chat.unreadCount ?? (chat.hasUnread ? 1 : 0));
  }, 0);
}
