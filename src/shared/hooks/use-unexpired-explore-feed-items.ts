import { useEffect, useState } from "react";

import type { ExploreFeedItem } from "@/shared/schemas";

const MAX_TIMEOUT_MS = 2_147_483_647;

export function useUnexpiredExploreFeedItems(items: ExploreFeedItem[]) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const nextExpiry = items.reduce<number | null>((nearest, item) => {
      if (item.type !== "FORMATION_OPENING") return nearest;

      const expiresAt = new Date(item.opening.expiresAt).getTime();
      if (expiresAt <= now) return nearest;

      return nearest === null || expiresAt < nearest ? expiresAt : nearest;
    }, null);

    if (nextExpiry === null) return undefined;

    const timeoutId = window.setTimeout(
      () => setNow(Date.now()),
      Math.min(MAX_TIMEOUT_MS, Math.max(0, nextExpiry - now + 50)),
    );

    return () => window.clearTimeout(timeoutId);
  }, [items, now]);

  return items.filter(
    (item) =>
      item.type !== "FORMATION_OPENING" ||
      new Date(item.opening.expiresAt).getTime() > now,
  );
}
