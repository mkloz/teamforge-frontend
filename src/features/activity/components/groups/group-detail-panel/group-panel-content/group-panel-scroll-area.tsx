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
        "flex-1 overflow-y-auto",
        isMobile && "scrollbar-hide pb-[env(safe-area-inset-bottom)]",
      )}
    >
      {children}
    </div>
  );
}
