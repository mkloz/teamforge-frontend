import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";
import { NotificationsDrawerSkeleton } from "./notifications-drawer-skeleton";

interface NotificationsDrawerLoadingProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawerLoading({
  open,
  onClose,
}: NotificationsDrawerLoadingProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      direction={isDesktop ? "right" : "bottom"}
    >
      <DrawerContent
        className={cn(
          "border-border bg-canvas text-ink shadow-none",
          isDesktop
            ? "lg:w-96 lg:rounded-l-2xl lg:border-l"
            : "max-lg:max-h-screen max-lg:rounded-t-2xl max-lg:border-t",
        )}
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>Notifications</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <NotificationsDrawerSkeleton />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
