import { type ReactNode, useRef } from "react";
import { useEventCallback } from "usehooks-ts";

import { useCollapsiblePanelHeader } from "@/features/activity/hooks/use-collapsible-panel-header";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import { scrollElementToTop } from "@/shared/lib/scroll-to-top";
import { cn } from "@/shared/lib/utils";

interface GroupPanelScrollControls {
  isCompactVisible: boolean;
  scrollToTop: () => void;
}

interface GroupPanelScrollAreaProps {
  children: ReactNode | ((controls: GroupPanelScrollControls) => ReactNode);
  isMobile: boolean;
  resetKey?: string;
}

export function GroupPanelScrollArea({
  children,
  isMobile,
  resetKey,
}: GroupPanelScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { handleScroll, isCompactVisible, resetHeader } =
    useCollapsiblePanelHeader({
      collapsedHeight: 72,
      enabled: true,
      expandedHeight: isMobile ? 176 : 160,
      ref: scrollRef,
    });

  const scrollToTop = useEventCallback(() => {
    scrollElementToTop(scrollRef.current);
  });

  useResetScrollOnChange({
    enabled: Boolean(resetKey),
    onReset: resetHeader,
    ref: scrollRef,
    resetKey,
  });

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={cn(
        "scrollbar-thin flex-1 overflow-y-auto [--collapsible-panel-collapsed-height:4.5rem] [--collapsible-panel-compact-opacity:0] [--collapsible-panel-compact-scrim-opacity:0] [--collapsible-panel-original-card-delay:0ms] [--collapsible-panel-original-card-opacity:1] [--collapsible-panel-original-card-y:0px] [--collapsible-panel-original-pointer-events:auto] [overflow-anchor:none] [scrollbar-color:var(--muted-foreground)_transparent]",
        isMobile
          ? "scrollbar-hide pb-6 [--collapsible-panel-expanded-height:11rem]"
          : "[--collapsible-panel-expanded-height:10rem]",
      )}
    >
      {typeof children === "function"
        ? children({ isCompactVisible, scrollToTop })
        : children}
    </div>
  );
}
