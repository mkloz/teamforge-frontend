import { TeamForgeLogo } from "@/assets/logo";
import { Button } from "@/shared/components/ui/button";
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
        // Hide on mobile!
        "hidden md:flex",
        // Sticky full-width bar, always on top
        "fixed top-0 left-0 right-0 z-50 h-16",
        "items-center gap-3 px-4",
        "bg-background/95 backdrop-blur-md border-b border-border",
        className,
      )}
    >
      {/* ── Left: Logo + Wordmark (all screen sizes) ───────────────────────── */}
      <Link
        to="/home"
        className={cn(
          "flex items-center gap-2 select-none shrink-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg",
        )}
        aria-label="TeamForge home"
      >
        <TeamForgeLogo
          className="w-7 h-7 sm:w-8 sm:h-8"
          showBackground={false}
        />
        <span className="font-sans text-sm sm:text-base tracking-tight leading-none">
          <span className="text-foreground font-medium">Team</span>
          <span className="text-primary font-bold">Forge</span>
        </span>
      </Link>

      {/* ── Centre: Search bar (desktop only — mobile uses icon button) ──────── */}
      <div className="hidden lg:flex flex-1 justify-center px-4">
        <Button
          variant="ghost"
          onClick={onSearchClick}
          aria-label="Open search"
          className={cn(
            "w-full max-w-sm flex items-center gap-2.5 h-9 px-3.5 rounded-xl border-2 border-transparent",
            "bg-muted text-muted-foreground text-sm font-medium",
            "hover:border-primary/20 hover:text-foreground hover:bg-muted/80",
            "active:translate-y-px active:scale-[0.99]",
          )}
        >
          <Search
            size={13}
            aria-hidden="true"
            className="shrink-0 opacity-60"
          />
          <span className="flex-1 text-left">Search activities, people...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-micro text-muted-foreground whitespace-nowrap">
            <span className="text-micro">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* ── Right: Actions cluster ───────────────────────────────────────────── */}
      <div className="ml-auto lg:ml-0 flex items-center gap-1">
        {/* Mobile search icon */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSearchClick}
          aria-label="Open search"
          className="lg:hidden h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Search size={18} aria-hidden="true" />
        </Button>

        {notificationsTrigger}
        {userMenuSlot}
      </div>
    </header>
  );
}
