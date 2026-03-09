import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationItem } from "./notification-item";

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  const { items, markRead, markAllRead } = useNotifications();
  const drawerRef = useRef<HTMLDivElement>(null);

  const today = items.filter((n) => {
    const diff = Date.now() - n.timestamp.getTime();
    return diff < 1000 * 60 * 60 * 24;
  });
  const earlier = items.filter((n) => {
    const diff = Date.now() - n.timestamp.getTime();
    return diff >= 1000 * 60 * 60 * 24;
  });

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Trap focus
  useEffect(() => {
    if (open) drawerRef.current?.focus();
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[55] bg-black/40 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Drawer panel
          Desktop: right sheet (w-96)
          Mobile: bottom sheet (max-h-[75vh]) */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        aria-hidden={!open}
        tabIndex={-1}
        className={cn(
          "fixed z-[56] bg-card border-border outline-none",
          // Desktop: right side panel
          "lg:top-0 lg:right-0 lg:bottom-0 lg:w-96 lg:border-l lg:rounded-none",
          "lg:translate-x-0 lg:transition-transform lg:duration-200",
          open ? "lg:translate-x-0" : "lg:translate-x-full",
          // Mobile: bottom sheet
          "max-lg:left-0 max-lg:right-0 max-lg:bottom-0 max-lg:max-h-[75vh]",
          "max-lg:rounded-t-2xl max-lg:border-t",
          "max-lg:transition-transform max-lg:duration-200",
          open ? "max-lg:translate-y-0" : "max-lg:translate-y-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <h2 className="font-semibold text-base text-foreground">Notifications</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="overflow-y-auto flex-1 max-h-[calc(75vh-3.5rem)] lg:max-h-[calc(100vh-3.5rem)]">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No notifications yet.
            </p>
          ) : (
            <>
              {today.length > 0 && (
                <section aria-label="Today's notifications">
                  <div className="px-4 py-2 sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                  <div className="px-4 py-2 sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
      </div>
    </>
  );
}
