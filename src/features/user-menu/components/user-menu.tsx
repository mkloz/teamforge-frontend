import { AuthApi } from "@/features/auth/api/auth.api";
import { AuthQueries } from "@/features/auth/api/auth.queries";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Theme, useTheme } from "@/shared/store/theme.store";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUserMenu } from "../hooks/use-user-menu";

function getUserInitials(name?: string | null) {
  if (!name) {
    return "TF";
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "TF";
}

export function UserMenu() {
  const { open, toggle, close } = useUserMenu();
  const { theme, setTheme, isDark } = useTheme();
  const { data: currentUser } = AuthQueries.useCurrentUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const userInitials = getUserInitials(currentUser?.name);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        e.target instanceof Node &&
        !containerRef.current?.contains(e.target)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, close]);

  const handleThemeToggle = () => {
    setTheme(isDark ? Theme.LIGHT : Theme.DARK);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await AuthApi.logoutUser();
      close();
      await navigate({ to: "/" });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Avatar trigger — min 44x44 touch target per WCAG 2.5.5 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="rounded-full shrink-0"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open user menu"
      >
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            "bg-primary/10 text-primary border border-primary/20",
          )}
        >
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-bold tracking-wide">
              {userInitials}
            </span>
          )}
        </span>
      </Button>

      {/* Dropdown */}
      <div
        role="menu"
        aria-label="User menu"
        className={cn(
          // Position: right-aligned below the avatar with a small gap
          "absolute right-0 top-[calc(100%+6px)] z-70 w-56 origin-top-right",
          // Cap height so it never runs off short viewports
          "max-h-[min(340px,calc(100vh-5rem))] overflow-y-auto",
          "rounded-2xl border border-border bg-popover shadow-xl shadow-black/10",
          "transition duration-150",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none",
        )}
      >
        {/* User info header */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-medium text-foreground truncate">
            {currentUser?.name ?? "Account details syncing"}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {currentUser?.email ?? "Your session is active"}
          </p>
        </div>

        {/* Menu items */}
        <div className="py-1.5">
          {/* Theme toggle */}
          <button
            type="button"
            role="menuitem"
            onClick={handleThemeToggle}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 text-sm",
              "text-foreground hover:bg-muted transition-colors duration-100",
              "focus-visible:outline-none focus-visible:bg-muted",
            )}
          >
            {isDark ? (
              <Sun
                size={15}
                aria-hidden="true"
                className="text-muted-foreground"
              />
            ) : (
              <Moon
                size={15}
                aria-hidden="true"
                className="text-muted-foreground"
              />
            )}
            {isDark ? "Switch to Light mode" : "Switch to Dark mode"}
            <span className="ml-auto text-xs text-muted-foreground">
              {theme === Theme.DARK ? "Dark" : "Light"}
            </span>
          </button>

          {/* Profile */}
          <Link
            to="/profile"
            role="menuitem"
            onClick={close}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm",
              "text-foreground hover:bg-muted transition-colors duration-100",
              "focus-visible:outline-none focus-visible:bg-muted",
            )}
          >
            <User
              size={15}
              aria-hidden="true"
              className="text-muted-foreground"
            />
            View Profile
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            role="menuitem"
            onClick={close}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm",
              "text-foreground hover:bg-muted transition-colors duration-100",
              "focus-visible:outline-none focus-visible:bg-muted",
            )}
          >
            <Settings
              size={15}
              aria-hidden="true"
              className="text-muted-foreground"
            />
            Settings
          </Link>
        </div>

        {/* Divider + sign out */}
        <div className="border-t border-border py-1.5">
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 text-sm",
              "disabled:opacity-60 disabled:pointer-events-none",
              "text-destructive hover:bg-destructive/10 transition-colors duration-100",
              "focus-visible:outline-none focus-visible:bg-destructive/10",
            )}
          >
            <LogOut size={15} aria-hidden="true" />
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
