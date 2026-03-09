import { TeamForgeLogo } from "@/assets/logo";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { ReactNode } from "react";

interface AppTopbarProps {
  /** Slot for the UserMenu dropdown (injected from AppLayout to avoid coupling) */
  userMenuSlot: ReactNode;
  /** Slot for the NotificationsDrawer trigger (injected from AppLayout) */
  notificationsTrigger: ReactNode;
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
        // Relative so the absolutely-centred search can use this as its containing block
        "relative flex items-center px-4",
        "bg-background/95 backdrop-blur-md border-b border-border",
        className,
      )}
    >
      {/* Logo — mobile only (desktop logo lives in the sidebar) */}
      <Link
        to="/home"
        className={cn(
          "flex items-center gap-2 select-none shrink-0 lg:hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg",
        )}
        aria-label="TeamForge home"
      >
        <TeamForgeLogo className="w-7 h-7" showBackground={false} />
        <span className="font-sans text-base font-semibold tracking-tight">
          <span className="text-foreground">Team</span>
          <span className="text-primary">Forge</span>
        </span>
      </Link>

      {/*
        Desktop search — absolutely centred within the topbar so it stays
        visually centred regardless of left/right slot widths.
        Hidden on mobile (mobile uses the icon button in the right cluster).
      */}
      <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Open search"
          className={cn(
            "w-full flex items-center gap-2.5 h-9 px-3.5 rounded-xl",
            "bg-muted border border-border text-muted-foreground text-sm",
            "hover:border-primary/30 hover:text-foreground hover:bg-muted/80",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <Search size={13} aria-hidden="true" className="shrink-0 opacity-60" />
          <span>Search activities, people...</span>
          {/* Keyboard shortcut hint */}
          <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
            <span className="text-[11px]">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Push right-side actions to the far right */}
      <div className="ml-auto flex items-center gap-1">
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

        {/* Notifications trigger */}
        {notificationsTrigger}

        {/* User menu */}
        {userMenuSlot}
      </div>
    </header>
  );
}
