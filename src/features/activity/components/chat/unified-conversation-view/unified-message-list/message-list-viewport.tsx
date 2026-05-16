import type { ReactNode, RefObject, UIEventHandler } from "react";

interface MessageListViewportProps {
  children: ReactNode;
  containerRef?: RefObject<HTMLDivElement | null>;
  onScroll: UIEventHandler<HTMLDivElement>;
  totalHeight: number;
}

export function MessageListViewport({
  children,
  containerRef,
  onScroll,
  totalHeight,
}: MessageListViewportProps) {
  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className="scrollbar-hide relative z-10 min-w-0 flex-1 scroll-mt-12 overflow-y-auto overflow-x-hidden scroll-smooth px-2 pt-2.5 pb-0 sm:px-3 md:px-4 md:pt-3"
    >
      <div
        className="relative min-h-full w-full min-w-0 pb-3 md:pb-2"
        style={totalHeight > 0 ? { height: `${totalHeight}px` } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
