const EMPTY_TIME_SCROLL_SNAPSHOT = "00";

export type TimeScrollSnapshot = "00" | "01" | "10" | "11";

export function getTimeScrollSnapshot(
  node: HTMLDivElement | null,
): TimeScrollSnapshot {
  if (!node) {
    return EMPTY_TIME_SCROLL_SNAPSHOT;
  }

  const maxScrollTop = node.scrollHeight - node.clientHeight;

  return `${node.scrollTop > 2 ? "1" : "0"}${
    node.scrollTop < maxScrollTop - 2 ? "1" : "0"
  }` as TimeScrollSnapshot;
}

export function getEmptyTimeScrollSnapshot() {
  return EMPTY_TIME_SCROLL_SNAPSHOT;
}

export function subscribeToTimeScrollNode(
  node: HTMLDivElement | null,
  onStoreChange: () => void,
) {
  if (!node) {
    return () => {};
  }

  const resizeObserver =
    typeof ResizeObserver === "function"
      ? new ResizeObserver(onStoreChange)
      : null;

  node.addEventListener("scroll", onStoreChange, { passive: true });
  resizeObserver?.observe(node);

  return () => {
    node.removeEventListener("scroll", onStoreChange);
    resizeObserver?.disconnect();
  };
}
