export interface ElementSize {
  height: number;
  width: number;
}

export function observeElementSize(
  element: HTMLElement | null,
  onSizeChange: (size: ElementSize) => void,
) {
  if (!element) {
    return () => undefined;
  }

  const updateSize = () => {
    onSizeChange({
      height: element.clientHeight,
      width: element.clientWidth,
    });
  };

  updateSize();

  if (typeof ResizeObserver === "undefined") {
    return () => undefined;
  }

  const observer = new ResizeObserver(updateSize);
  observer.observe(element);

  return () => {
    observer.disconnect();
  };
}
