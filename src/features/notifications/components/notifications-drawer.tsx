import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationItem } from "./notification-item";

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({
  open,
  onClose,
}: NotificationsDrawerProps) {
  const { items, markRead, markAllRead } = useNotifications();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Freeze time during render to avoid impurity warnings
  const [now] = useState(() => Date.now());

  const today = items.filter((n) => now - n.timestamp.getTime() < 86_400_000);
  const earlier = items.filter(
    (n) => now - n.timestamp.getTime() >= 86_400_000,
  );

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Focus trap — focus panel when it opens + trap Tab key inside
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => drawerRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Trap keyboard focus inside the drawer when open
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !drawerRef.current) return;
    const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-55 bg-black/50 backdrop-blur-subtle",
          "transition-opacity duration-200",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/*
        Drawer panel
        Desktop (lg+): slides in from the right
        Mobile (<lg):  slides up from the bottom
        Using data-[open] attribute so a single translate utility per axis
        doesn't conflict with conditional class merging.
      */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        tabIndex={-1}
        data-open={open}
        // @ts-expect-error — inert is valid HTML but not yet in React types
        inert={!open ? "" : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          "fixed z-56 flex flex-col bg-card border-border outline-none",
          // ── Desktop: right-side panel ─────────────────────────────────────
          "lg:top-0 lg:right-0 lg:bottom-0 lg:w-96",
          "lg:border-l lg:rounded-none",
          "lg:transition-transform lg:duration-300 lg:ease-in-out",
          open ? "lg:translate-x-0" : "lg:translate-x-full",
          // ── Mobile: bottom sheet ──────────────────────────────────────────
          "max-lg:left-0 max-lg:right-0 max-lg:bottom-0 max-lg:max-h-[78vh]",
          "max-lg:rounded-t-3xl max-lg:border-t",
          "max-lg:transition-transform max-lg:duration-300 max-lg:ease-in-out",
          open ? "max-lg:translate-y-0" : "max-lg:translate-y-full",
          // Visibility — keep it render-able but hidden when closed
          !open && "pointer-events-none",
        )}
      >
        {/* Drag handle (mobile only) — enhanced visibility */}
        <div
          className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0 lg:hidden"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-border shrink-0">
          <h2 className="font-semibold text-base text-foreground tracking-tight">
            Notifications
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs text-primary hover:text-primary/70 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X size={15} aria-hidden="true" />
            </button>
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
                  <div className="px-5 py-2.5 sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                  <div className="px-5 py-2.5 sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
