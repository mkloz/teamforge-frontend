import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";

export interface ViewportAnchorSnapshot {
  key: string;
  offsetTop: number;
}

export interface PrependAnchorSnapshot {
  anchor: ViewportAnchorSnapshot | null;
  previousHeight: number;
  previousScrollTop: number;
}

export function captureViewportAnchor(
  viewport: HTMLDivElement | null,
  visibleBlocks: VirtualizedMessageBlock[],
  getBlockElement: (key: string) => HTMLDivElement | null,
): ViewportAnchorSnapshot | null {
  if (!viewport) {
    return null;
  }

  const viewportTop = viewport.getBoundingClientRect().top;

  for (const block of visibleBlocks) {
    const node = getBlockElement(block.key);

    if (!node) {
      continue;
    }

    const rect = node.getBoundingClientRect();
    const offsetTop = rect.top - viewportTop;
    const offsetBottom = rect.bottom - viewportTop;

    if (offsetBottom > 0) {
      return {
        key: block.key,
        offsetTop,
      };
    }
  }

  const fallbackBlock = visibleBlocks[0];
  const fallbackNode = fallbackBlock
    ? getBlockElement(fallbackBlock.key)
    : null;

  if (!fallbackBlock || !fallbackNode) {
    return null;
  }

  return {
    key: fallbackBlock.key,
    offsetTop: fallbackNode.getBoundingClientRect().top - viewportTop,
  };
}

export function restoreViewportAnchor(
  viewport: HTMLDivElement | null,
  anchor: ViewportAnchorSnapshot | null,
  getBlockElement: (key: string) => HTMLDivElement | null,
) {
  if (!viewport || !anchor) {
    return false;
  }

  const node = getBlockElement(anchor.key);

  if (!node) {
    return false;
  }

  const currentOffsetTop =
    node.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
  const delta = currentOffsetTop - anchor.offsetTop;

  if (Math.abs(delta) > 0.5) {
    viewport.scrollTo({
      behavior: "instant",
      top: Math.max(viewport.scrollTop + delta, 0),
    });
  }

  return true;
}

export function restorePrependAnchor(
  viewport: HTMLDivElement,
  prependAnchor: PrependAnchorSnapshot,
  totalHeight: number,
  getBlockElement: (key: string) => HTMLDivElement | null,
) {
  const restored = restoreViewportAnchor(
    viewport,
    prependAnchor.anchor,
    getBlockElement,
  );

  if (restored) {
    return;
  }

  const delta = totalHeight - prependAnchor.previousHeight;
  viewport.scrollTop = prependAnchor.previousScrollTop + delta;
}
