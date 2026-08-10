import { type KeyboardEvent, useEffect, useState } from "react";

import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { isGifAttachment } from "@/features/activity/lib/gif-attachments";

export type LightboxNavigationDirection = -1 | 0 | 1;

interface UseLightboxNavigationOptions {
  attachments: UnifiedAttachment[];
  isOpen: boolean;
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
}

export function useLightboxNavigation({
  attachments,
  isOpen,
  selectedIndex,
  setSelectedIndex,
}: UseLightboxNavigationOptions) {
  const count = attachments.length;
  const boundedIndex = getBoundedLightboxIndex(selectedIndex, count);
  const currentMedia = boundedIndex === null ? null : attachments[boundedIndex];
  const [direction, setDirection] = useState<LightboxNavigationDirection>(0);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (selectedIndex !== boundedIndex) {
      setSelectedIndex(boundedIndex);
    }
  }, [boundedIndex, selectedIndex, setSelectedIndex]);

  useEffect(() => {
    if (!isOpen) {
      setAnnouncement("");
      setDirection(0);
    }
  }, [isOpen]);

  function selectIndex(nextIndex: number) {
    if (boundedIndex === null || nextIndex === boundedIndex) {
      return false;
    }

    const clampedIndex = Math.max(0, Math.min(nextIndex, count - 1));

    if (clampedIndex === boundedIndex) {
      return false;
    }

    setDirection(clampedIndex > boundedIndex ? 1 : -1);
    setSelectedIndex(clampedIndex);
    setAnnouncement(
      getLightboxSelectionAnnouncement(
        attachments[clampedIndex],
        clampedIndex,
        count,
      ),
    );
    return true;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!shouldHandleLightboxNavigationKey(event)) {
      return;
    }

    const nextIndex = getKeyboardNavigationIndex(
      event.key,
      boundedIndex,
      count,
    );

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    selectIndex(nextIndex);
  }

  return {
    announcement,
    count,
    currentIndex: boundedIndex,
    currentMedia: currentMedia ?? null,
    direction,
    goFirst: () => selectIndex(0),
    goLast: () => selectIndex(count - 1),
    goNext: () => selectIndex((boundedIndex ?? 0) + 1),
    goPrevious: () => selectIndex((boundedIndex ?? 0) - 1),
    handleKeyDown,
    isNextDisabled: boundedIndex === null || boundedIndex >= count - 1,
    isPreviousDisabled: boundedIndex === null || boundedIndex <= 0,
    selectIndex,
  };
}

export function getBoundedLightboxIndex(
  selectedIndex: number | null,
  count: number,
) {
  if (selectedIndex === null || count <= 0) {
    return null;
  }

  return Math.max(0, Math.min(selectedIndex, count - 1));
}

export function getLightboxSelectionAnnouncement(
  media: UnifiedAttachment | undefined,
  index: number,
  count: number,
) {
  const type = media
    ? isGifAttachment(media)
      ? "GIF"
      : media.type === "VIDEO"
        ? "Video"
        : "Image"
    : "Media";
  const name = media?.name ? `: ${media.name}` : "";

  return `${type} ${index + 1} of ${count}${name}`;
}

function getKeyboardNavigationIndex(
  key: string,
  selectedIndex: number | null,
  count: number,
) {
  if (selectedIndex === null || count <= 1) {
    return null;
  }

  if (key === "ArrowLeft") {
    return Math.max(0, selectedIndex - 1);
  }

  if (key === "ArrowRight") {
    return Math.min(count - 1, selectedIndex + 1);
  }

  return null;
}

function shouldHandleLightboxNavigationKey(event: KeyboardEvent<HTMLElement>) {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.repeat ||
    event.nativeEvent.isComposing
  ) {
    return false;
  }

  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) {
    return false;
  }

  const target = event.target;

  return !(
    target instanceof HTMLElement &&
    target.closest(
      "button, a[href], input, textarea, select, video, audio, [contenteditable='true'], [role='button'], [role='link'], [role='menuitem'], [role='option'], [role='slider']",
    )
  );
}
