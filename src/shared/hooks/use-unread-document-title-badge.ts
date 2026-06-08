import { useEffect } from "react";

import { setDocumentTitleBadge } from "@/shared/lib/document-metadata";

interface UseUnreadDocumentTitleBadgeOptions {
  enabled?: boolean;
}

export function useUnreadDocumentTitleBadge(
  unreadCount: number,
  { enabled = true }: UseUnreadDocumentTitleBadgeOptions = {},
) {
  useEffect(() => {
    if (!enabled) {
      setDocumentTitleBadge(0);
      return;
    }

    setDocumentTitleBadge(unreadCount);
  }, [enabled, unreadCount]);

  useEffect(() => {
    return () => {
      setDocumentTitleBadge(0);
    };
  }, []);
}
