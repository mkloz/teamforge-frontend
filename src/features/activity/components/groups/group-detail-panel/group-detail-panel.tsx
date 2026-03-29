import { cn } from "@/shared/lib/utils";
import { useCallback, useEffect } from "react";
import type { Group } from "@/features/activity/types/groups.types";
import { GroupPanelContent } from "./group-panel-content";

interface GroupDetailPanelProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * GroupDetailPanel - Side panel showing group information, members, and plans.
 * Optimized for both desktop sidebar and mobile sheet.
 */
export function GroupDetailPanel({
  group,
  isOpen,
  onClose,
}: GroupDetailPanelProps) {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when mobile sheet is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-full border-l border-border bg-canvas",
          "transition-all duration-300 ease-in-out",
          isOpen ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden",
        )}
      >
        <GroupPanelContent group={group} onClose={onClose} />
      </aside>

      {/* Mobile/Tablet overlay sheet */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-50",
          "transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Sheet */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-canvas rounded-t-3xl",
            "transition-transform duration-300 ease-out",
            "max-h-[85vh] flex flex-col overflow-hidden shadow-2xl",
            isOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          {/* Drag handle */}
          <div className="flex shrink-0 justify-center py-3">
            <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>

          <GroupPanelContent group={group} onClose={onClose} isMobile />
        </div>
      </div>
    </>
  );
}
