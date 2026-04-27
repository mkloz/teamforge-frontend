import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useState } from "react";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationItem } from "./notification-item";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({
  open,
  onClose,
}: NotificationsDrawerProps) {
  const { items, markRead, markAllRead } = useNotifications();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Freeze time during render to avoid impurity warnings
  const [now] = useState(() => Date.now());

  const today = items.filter((n) => now - n.timestamp.getTime() < 86_400_000);
  const earlier = items.filter(
    (n) => now - n.timestamp.getTime() >= 86_400_000,
  );

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      direction={isDesktop ? "right" : "bottom"}
    >
      <DrawerContent
        className={cn(
          "bg-card border-border",
          isDesktop
            ? "lg:w-96 lg:rounded-none lg:border-l"
            : "max-lg:rounded-t-3xl max-lg:border-t max-lg:max-h-[78vh]",
        )}
      >
        <DrawerHeader className="sr-only">
          <DrawerTitle>Notifications</DrawerTitle>
        </DrawerHeader>

        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
          <h2 className="font-bold text-lg text-white tracking-tight">
            Notifications
          </h2>
          <div className="flex items-center gap-1.5">
            <Button
              variant="link"
              size="sm"
              onClick={markAllRead}
              className="text-[12px] text-forge-teal hover:text-forge-teal/80 font-bold h-auto p-0"
            >
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              aria-label="Close notifications"
              className="text-slate-muted hover:text-ink rounded-lg p-0"
            >
              <X size={20} strokeWidth={2.5} aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16 px-4">
              No notifications yet.
            </p>
          ) : (
            <>
              {today.length > 0 && (
                <section aria-label="Today's notifications">
                  <div className="px-6 py-4 sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/50 z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-muted/60">
                      Today
                    </p>
                  </div>
                  {today.map((n) => (
                    <NotificationItem key={n.id} item={n} onRead={markRead} />
                  ))}
                </section>
              )}
              {earlier.length > 0 && (
                <section aria-label="Earlier notifications">
                  <div className="px-6 py-4 sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/50 z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-muted/60">
                      Earlier
                    </p>
                  </div>
                  {earlier.map((n) => (
                    <NotificationItem key={n.id} item={n} onRead={markRead} />
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
