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
      className="relative z-10 flex-1 overflow-y-auto px-1 pt-4 pb-0 scroll-smooth scrollbar-none scroll-margin-top-12"
    >
      <div className="relative pb-2" style={{ height: `${totalHeight}px` }}>
        {children}
      </div>
    </div>
  );
}
