import { cn } from "@/shared/lib/utils";
import { useCallback, useEffect } from "react";
import type { Group } from "@/features/activity/types/groups.types";
import { GroupPanelContent } from "./group-panel-content";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

interface GroupDetailPanelProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupDetailPanel({
  group,
  isOpen,
  onClose,
}: GroupDetailPanelProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-full border-l border-border bg-canvas",
          "transition duration-300 ease-in-out",
          isOpen ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden",
        )}
      >
        <GroupPanelContent group={group} onClose={onClose} />
      </aside>

      {/* Mobile/Tablet overlay sheet using shadcn Drawer */}
      <Drawer
        open={isOpen && !isDesktop}
        onOpenChange={(open) => !open && onClose()}
      >
        <DrawerContent className="lg:hidden bg-canvas border-t rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{group.name} Details</DrawerTitle>
          </DrawerHeader>
          <GroupPanelContent group={group} onClose={onClose} isMobile />
        </DrawerContent>
      </Drawer>
    </>
  );
}
