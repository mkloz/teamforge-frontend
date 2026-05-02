const DEFAULT_SCROLL_BEHAVIOR: ScrollBehavior = "smooth";

export function scrollToPageTop(
  behavior: ScrollBehavior = DEFAULT_SCROLL_BEHAVIOR,
) {
  window.scrollTo({ top: 0, behavior });
}

export function scrollElementIntoViewById(
  id: string,
  options: ScrollIntoViewOptions,
) {
  document.getElementById(id)?.scrollIntoView(options);
}

export function getElementById<T extends HTMLElement = HTMLElement>(
  id: string,
) {
  return document.getElementById(id) as T | null;
}

export function scrollToElementProgress(
  element: HTMLElement,
  progress: number,
  behavior: ScrollBehavior = DEFAULT_SCROLL_BEHAVIOR,
) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const scrollableHeight = Math.max(
    element.offsetHeight - window.innerHeight,
    0,
  );

  window.scrollTo({
    top: element.offsetTop + clampedProgress * scrollableHeight,
    behavior,
  });
}
