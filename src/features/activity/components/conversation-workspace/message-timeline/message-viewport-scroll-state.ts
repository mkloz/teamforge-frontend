export function getViewportScrollState(
  viewport: HTMLDivElement,
  previousScrollTop: number | null,
) {
  const nextScrollTop = viewport.scrollTop;

  return {
    distanceFromBottom:
      viewport.scrollHeight - nextScrollTop - viewport.clientHeight,
    isScrollingUp:
      previousScrollTop !== null && nextScrollTop < previousScrollTop,
    nextScrollTop,
  };
}
