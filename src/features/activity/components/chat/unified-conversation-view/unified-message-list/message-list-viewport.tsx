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
      className="scrollbar-none scroll-margin-top-12 relative z-10 flex-1 overflow-y-auto scroll-smooth px-1 pt-4 pb-0"
    >
      <div className="relative pb-2" style={{ height: `${totalHeight}px` }}>
        {children}
      </div>
    </div>
  );
}
