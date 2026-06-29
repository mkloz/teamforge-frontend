import type { MouseEvent } from "react";

import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";

interface UseLightboxNavigationOptions {
  attachments: UnifiedAttachment[];
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
}

export function useLightboxNavigation({
  attachments,
  selectedIndex,
  setSelectedIndex,
}: UseLightboxNavigationOptions) {
  const count = attachments.length;
  const currentMedia =
    selectedIndex !== null ? attachments[selectedIndex] : null;

  function handleNext(event: MouseEvent) {
    event.stopPropagation();

    if (selectedIndex !== null && count > 0) {
      setSelectedIndex((selectedIndex + 1) % count);
    }
  }

  function handlePrev(event: MouseEvent) {
    event.stopPropagation();

    if (selectedIndex !== null && count > 0) {
      setSelectedIndex((selectedIndex - 1 + count) % count);
    }
  }

  return {
    count,
    currentMedia,
    handleNext,
    handlePrev,
  };
}
