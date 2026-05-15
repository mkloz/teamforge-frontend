import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

interface GroupPanelScrollAreaProps {
  children: ReactNode;
  isMobile: boolean;
}

export function GroupPanelScrollArea({
  children,
  isMobile,
}: GroupPanelScrollAreaProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto [scrollbar-color:var(--muted-foreground)_transparent] [scrollbar-width:thin]",
        isMobile && "scrollbar-hide pb-6",
      )}
    >
      {children}
    </div>
  );
}
