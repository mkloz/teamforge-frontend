import { type ReactNode, useRef } from "react";

import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";
import { cn } from "@/shared/lib/utils";

interface GroupPanelScrollAreaProps {
  children: ReactNode;
  isMobile: boolean;
  resetKey?: string;
}

export function GroupPanelScrollArea({
  children,
  isMobile,
  resetKey,
}: GroupPanelScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useResetScrollOnChange({
    enabled: Boolean(resetKey),
    ref: scrollRef,
    resetKey,
  });

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 overflow-y-auto [scrollbar-color:var(--muted-foreground)_transparent] [scrollbar-width:thin]",
        isMobile && "scrollbar-hide pb-6",
      )}
    >
      {children}
    </div>
  );
}
