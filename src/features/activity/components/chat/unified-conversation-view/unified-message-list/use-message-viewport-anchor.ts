import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import {
  captureViewportAnchor,
  restorePrependAnchor,
  restoreViewportAnchor,
  type PrependAnchorSnapshot,
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
    if (
      !prependAnchorRef.current ||
      !containerRef?.current ||
      isLoadingOlderMessages
    ) {
      return;
    }

    restorePrependAnchor(
      containerRef.current,
      prependAnchorRef.current,
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
    const totalHeightChanged = previousTotalHeight !== totalHeight;

    if (
      !isNearBottom &&
      !isLoadingOlderMessages &&
      !prependAnchorRef.current &&
      totalHeightChanged &&
      viewportAnchorRef.current?.key === currentAnchor.key
    ) {
      restoreViewportAnchor(
        viewport,
        viewportAnchorRef.current,
        getBlockElement,
      );
      viewportAnchorRef.current = {
        key: currentAnchor.key,
        offsetTop: viewportAnchorRef.current.offsetTop,
      };
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
