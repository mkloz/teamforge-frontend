import type { MouseEvent } from "react";
import { useState } from "react";

import type { PinnedEntry } from "./chat-status-bar-types";

interface UseChatStatusBarNavigationOptions {
  entries: PinnedEntry[];
  onActivatePinnedMessage?: (messageId: string) => void;
  onUnpinPinnedMessage?: (messageId: string) => void;
  onViewDetails?: () => void;
}

export function useChatStatusBarNavigation({
  entries,
  onActivatePinnedMessage,
  onUnpinPinnedMessage,
  onViewDetails,
}: UseChatStatusBarNavigationOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const total = entries.length;
  const safeActiveIndex =
    total > 0 ? Math.min(activeIndex, total - 1) : activeIndex;
  const activeEntry = entries[safeActiveIndex];

  function activateEntry(entry: PinnedEntry) {
    if (entry.isPlan) {
      onViewDetails?.();
      return;
    }

    if (entry.messageId) {
      onActivatePinnedMessage?.(entry.messageId);
    }
  }

  function handleBarClick() {
    if (total === 0) {
      return;
    }

    const current = entries[safeActiveIndex];

    if (total === 1) {
      activateEntry(current);
      return;
    }

    const next = (safeActiveIndex + 1) % total;
    setDirection(1);
    setActiveIndex(next);
    activateEntry(entries[next]);
  }

  function handleUnpin(event: MouseEvent) {
    event.stopPropagation();

    const active = entries[safeActiveIndex];
    if (!active.messageId) {
      return;
    }

    const newTotal = total - 1;
    if (newTotal > 0 && safeActiveIndex >= newTotal) {
      setDirection(-1);
      setActiveIndex(newTotal - 1);
    }

    onUnpinPinnedMessage?.(active.messageId);
  }

  return {
    activeEntry,
    direction,
    handleBarClick,
    handleUnpin,
    safeActiveIndex,
    total,
  };
}
