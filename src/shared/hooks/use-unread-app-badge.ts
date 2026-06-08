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
      void clearAppBadge();
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
