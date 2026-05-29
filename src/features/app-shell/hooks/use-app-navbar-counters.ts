import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppNavbarCountersQueryOptions } from "@/features/app-shell/api/app-navbar-counters-query-options";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";
import type { ChatApi } from "@/shared/schemas";

export interface AppNavbarCounters {
  activityUnreadCount: number;
  notificationUnreadCount: number;
}

const NAVBAR_COUNTERS_DELAY_MS = 12_000;

export function useAppNavbarCounters(): AppNavbarCounters {
  const countersEnabled = useDelayedNavbarCountersEnabled();
  const chatsQuery = useQuery({
    ...AppNavbarCountersQueryOptions.chats(),
    enabled: countersEnabled,
  });
  const notificationUnreadCountQuery = useQuery({
    ...AppNavbarCountersQueryOptions.notificationUnreadCount(),
    enabled: countersEnabled,
  });

  return {
    activityUnreadCount: countUnreadChatMessages(chatsQuery.data ?? []),
    notificationUnreadCount: notificationUnreadCountQuery.data ?? 0,
  };
}

function useDelayedNavbarCountersEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const delayTask = scheduleDelay(() => {
      setEnabled(true);
    }, NAVBAR_COUNTERS_DELAY_MS);

    return () => {
      cancelDelay(delayTask);
    };
  }, []);

  return enabled;
}

function countUnreadChatMessages(chats: ChatApi[]) {
  return chats.reduce((total, chat) => {
    if (chat.isMuted) {
      return total;
    }

    return total + Math.max(0, chat.unreadCount ?? (chat.hasUnread ? 1 : 0));
  }, 0);
}
