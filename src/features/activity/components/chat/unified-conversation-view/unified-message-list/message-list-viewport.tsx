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
      className="scrollbar-hide relative z-10 flex-1 scroll-mt-12 overflow-y-auto scroll-smooth px-1 pt-4 pb-0"
    >
      <div className="relative pb-2" style={{ height: `${totalHeight}px` }}>
        {children}
      </div>
    </div>
  );
}
