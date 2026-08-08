import type { ReactNode } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";

interface NotificationsDrawerShellProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawerShell({
  children,
  open,
  onClose,
}: NotificationsDrawerShellProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      direction={isDesktop ? "right" : "bottom"}
    >
      <DrawerContent
        style={
          isDesktop
            ? {
                maxWidth: "none",
                width: "min(29rem, 34vw)",
              }
            : undefined
        }
        className={cn(
          "border-border bg-canvas text-ink shadow-none",
          isDesktop
            ? "lg:rounded-l-2xl lg:border-l"
            : "max-lg:h-dvh max-lg:max-h-dvh max-lg:rounded-none! max-lg:border-0! max-lg:pt-[env(safe-area-inset-top)]",
        )}
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>Notifications</DrawerTitle>
          <DrawerDescription>
            Recent account, group, and plan updates.
          </DrawerDescription>
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
}
