import { useEffect } from "react";

import { clearAppBadge, syncUnreadAppBadge } from "@/shared/lib/app-badge";

interface UseUnreadAppBadgeOptions {
  enabled?: boolean;
}

export function useUnreadAppBadge(
  unreadCount: number,
  { enabled = true }: UseUnreadAppBadgeOptions = {},
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    void syncUnreadAppBadge(unreadCount);
  }, [enabled, unreadCount]);

  useEffect(() => {
    return () => {
      void clearAppBadge();
    };
  }, []);
}
