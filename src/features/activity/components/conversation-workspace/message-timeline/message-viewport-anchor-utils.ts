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

  const viewportTop = getViewportTop(viewport);
  const visibleAnchor = getFirstVisibleBlockAnchor(
    visibleBlocks,
    getBlockElement,
    viewportTop,
  );

  return (
    visibleAnchor ??
    getFallbackBlockAnchor(visibleBlocks, getBlockElement, viewportTop)
  );
}

function getViewportTop(viewport: HTMLDivElement) {
  return viewport.getBoundingClientRect().top;
}

function getFirstVisibleBlockAnchor(
  visibleBlocks: VirtualizedMessageBlock[],
  getBlockElement: (key: string) => HTMLDivElement | null,
  viewportTop: number,
): ViewportAnchorSnapshot | null {
  for (const block of visibleBlocks) {
    const anchor = getVisibleBlockAnchor(block, getBlockElement, viewportTop);

    if (anchor) {
      return anchor;
    }
  }

  return null;
}

function getVisibleBlockAnchor(
  block: VirtualizedMessageBlock,
  getBlockElement: (key: string) => HTMLDivElement | null,
  viewportTop: number,
): ViewportAnchorSnapshot | null {
  const node = getBlockElement(block.key);

  if (!node) {
    return null;
  }

  const offsets = getBlockViewportOffsets(node, viewportTop);

  if (offsets.offsetBottom <= 0) {
    return null;
  }

  return {
    key: block.key,
    offsetTop: offsets.offsetTop,
  };
}

function getFallbackBlockAnchor(
  visibleBlocks: VirtualizedMessageBlock[],
  getBlockElement: (key: string) => HTMLDivElement | null,
  viewportTop: number,
): ViewportAnchorSnapshot | null {
  const fallbackBlock = visibleBlocks[0];
  const fallbackNode = fallbackBlock
    ? getBlockElement(fallbackBlock.key)
    : null;

  return fallbackBlock && fallbackNode
    ? {
        key: fallbackBlock.key,
        offsetTop: getBlockOffsetTop(fallbackNode, viewportTop),
      }
    : null;
}

function getBlockOffsetTop(node: HTMLDivElement, viewportTop: number) {
  return node.getBoundingClientRect().top - viewportTop;
}

function getBlockViewportOffsets(node: HTMLDivElement, viewportTop: number) {
  const rect = node.getBoundingClientRect();

  return {
    offsetBottom: rect.bottom - viewportTop,
    offsetTop: rect.top - viewportTop,
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

  const currentOffsetTop = getBlockOffsetTop(node, getViewportTop(viewport));
  const delta = currentOffsetTop - anchor.offsetTop;

  applyViewportAnchorDelta(viewport, delta);

  return true;
}

function applyViewportAnchorDelta(viewport: HTMLDivElement, delta: number) {
  if (Math.abs(delta) <= 0.5) {
    return;
  }

  viewport.scrollTo({
    behavior: "instant",
    top: Math.max(viewport.scrollTop + delta, 0),
  });
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

  viewport.scrollTop =
    prependAnchor.previousScrollTop +
    getPrependedHeightDelta(totalHeight, prependAnchor);
}

function getPrependedHeightDelta(
  totalHeight: number,
  prependAnchor: PrependAnchorSnapshot,
) {
  return totalHeight - prependAnchor.previousHeight;
}
