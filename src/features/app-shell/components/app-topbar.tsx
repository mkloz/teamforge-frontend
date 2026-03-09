import { TeamForgeLogo } from "@/assets/logo";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import type { ReactNode } from "react";

interface AppTopbarProps {
  /** Slot for the UserMenu dropdown (injected from AppLayout to avoid coupling) */
  userMenuSlot: ReactNode;
  /** Slot for the NotificationsDrawer trigger (injected from AppLayout) */
  notificationsTrigger: ReactNode;
  /** Unread notification count drives the badge on the bell icon */
  unreadCount?: number;
  onSearchClick: () => void;
  className?: string;
}

export function AppTopbar({
  userMenuSlot,
  notificationsTrigger,
  onSearchClick,
  className,
}: AppTopbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16",
        "flex items-center px-4 gap-3",
        "bg-background/95 backdrop-blur-md border-b border-border",
        className,
      )}
    >
      {/* Logo — hidden on desktop (sidebar has its own) */}
      <Link
        to="/home"
        className="flex items-center gap-2 select-none shrink-0 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        aria-label="TeamForge home"
      >
        <TeamForgeLogo className="w-7 h-7" showBackground={false} />
        <span className="font-sans text-base font-semibold tracking-tight">
          <span className="text-foreground">Team</span>
          <span className="text-primary">Forge</span>
        </span>
      </Link>

      {/* Desktop wordmark (visible lg+, since sidebar has its own logo) */}
      <Link
        to="/home"
        className="hidden lg:flex items-center gap-2 select-none shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
        aria-label="TeamForge home"
      >
        <TeamForgeLogo className="w-7 h-7" showBackground={false} />
        <span className="font-sans text-base font-semibold tracking-tight">
          <span className="text-foreground">Team</span>
          <span className="text-primary">Forge</span>
        </span>
      </Link>

      {/* Desktop inline search input */}
      <div className="hidden lg:flex flex-1 max-w-sm mx-auto">
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Open search"
          className={cn(
            "w-full flex items-center gap-2 h-9 px-3 rounded-xl",
            "bg-muted border border-border text-muted-foreground text-sm",
            "hover:border-primary/40 hover:text-foreground transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Search size={14} aria-hidden="true" className="shrink-0" />
          <span>Search activities, people...</span>
        </button>
      </div>

      {/* Spacer on mobile */}
      <div className="flex-1 lg:flex-none" aria-hidden="true" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Mobile search icon */}
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Open search"
          className={cn(
            "lg:hidden flex h-9 w-9 items-center justify-center rounded-xl",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Search size={18} aria-hidden="true" />
        </button>

        {/* Notifications trigger — rendered by the notifications feature */}
        {notificationsTrigger}

        {/* User menu — rendered by the user-menu feature */}
        {userMenuSlot}
      </div>
    </header>
  );
}
