import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";

import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import {
  captureViewportAnchor,
  type PrependAnchorSnapshot,
  restorePrependAnchor,
  restoreViewportAnchor,
  type ViewportAnchorSnapshot,
} from "./message-viewport-anchor-utils";

interface UseMessageViewportAnchorInput {
  containerRef?: RefObject<HTMLDivElement | null>;
  getBlockElement: (key: string) => HTMLDivElement | null;
  isLoadingOlderMessages: boolean;
  isNearBottom: boolean;
  totalHeight: number;
  visibleBlocks: VirtualizedMessageBlock[];
}

interface ViewportAnchorRestoreInput {
  currentAnchor: ViewportAnchorSnapshot;
  isLoadingOlderMessages: boolean;
  isNearBottom: boolean;
  prependAnchor: PrependAnchorSnapshot | null;
  previousAnchor: ViewportAnchorSnapshot | null;
  previousTotalHeight: number;
  totalHeight: number;
}

export function useMessageViewportAnchor({
  containerRef,
  getBlockElement,
  isLoadingOlderMessages,
  isNearBottom,
  totalHeight,
  visibleBlocks,
}: UseMessageViewportAnchorInput) {
  const prependAnchorRef = useRef<PrependAnchorSnapshot | null>(null);
  const viewportAnchorRef = useRef<ViewportAnchorSnapshot | null>(null);
  const previousTotalHeightRef = useRef(0);

  useEffect(() => {
    const pendingRestore = getPendingPrependRestore(
      prependAnchorRef.current,
      containerRef?.current,
      isLoadingOlderMessages,
    );

    if (!pendingRestore) {
      return;
    }

    restorePrependAnchor(
      pendingRestore.viewport,
      pendingRestore.prependAnchor,
      totalHeight,
      getBlockElement,
    );

    prependAnchorRef.current = null;
  }, [containerRef, getBlockElement, isLoadingOlderMessages, totalHeight]);

  useLayoutEffect(() => {
    const viewport = containerRef?.current;
    const currentAnchor = captureViewportAnchor(
      viewport ?? null,
      visibleBlocks,
      getBlockElement,
    );

    if (!viewport || !currentAnchor) {
      viewportAnchorRef.current = null;
      previousTotalHeightRef.current = totalHeight;
      return;
    }

    const previousTotalHeight = previousTotalHeightRef.current;

    if (
      shouldRestoreViewportAnchor({
        currentAnchor,
        isLoadingOlderMessages,
        isNearBottom,
        prependAnchor: prependAnchorRef.current,
        previousAnchor: viewportAnchorRef.current,
        previousTotalHeight,
        totalHeight,
      })
    ) {
      restoreViewportAnchor(
        viewport,
        viewportAnchorRef.current,
        getBlockElement,
      );
      viewportAnchorRef.current = keepPreviousAnchorOffset(
        viewportAnchorRef.current,
        currentAnchor,
      );
      previousTotalHeightRef.current = totalHeight;
      return;
    }

    viewportAnchorRef.current = currentAnchor;
    previousTotalHeightRef.current = totalHeight;
  }, [
    containerRef,
    getBlockElement,
    isLoadingOlderMessages,
    isNearBottom,
    totalHeight,
    visibleBlocks,
  ]);

  function rememberPrependAnchor(previousScrollTop: number) {
    prependAnchorRef.current = {
      anchor: captureViewportAnchor(
        containerRef?.current ?? null,
        visibleBlocks,
        getBlockElement,
      ),
      previousHeight: totalHeight,
      previousScrollTop,
    };
  }

  return {
    rememberPrependAnchor,
  };
}

function getPendingPrependRestore(
  prependAnchor: PrependAnchorSnapshot | null,
  viewport: HTMLDivElement | null | undefined,
  isLoadingOlderMessages: boolean,
) {
  return prependAnchor && viewport && !isLoadingOlderMessages
    ? { prependAnchor, viewport }
    : null;
}

function shouldRestoreViewportAnchor({
  currentAnchor,
  isLoadingOlderMessages,
  isNearBottom,
  prependAnchor,
  previousAnchor,
  previousTotalHeight,
  totalHeight,
}: ViewportAnchorRestoreInput) {
  return (
    !isNearBottom &&
    !isLoadingOlderMessages &&
    !prependAnchor &&
    previousTotalHeight !== totalHeight &&
    previousAnchor?.key === currentAnchor.key
  );
}

function keepPreviousAnchorOffset(
  previousAnchor: ViewportAnchorSnapshot | null,
  currentAnchor: ViewportAnchorSnapshot,
): ViewportAnchorSnapshot {
  return {
    key: currentAnchor.key,
    offsetTop: previousAnchor?.offsetTop ?? currentAnchor.offsetTop,
  };
}
