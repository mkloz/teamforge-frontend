import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useState } from "react";

import { logoutCurrentSession } from "@/shared/api/auth-session-commands";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  buildAuthRouteNavigation,
  buildRouteLocationHref,
} from "@/shared/lib/auth-route";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { Theme, useTheme } from "@/shared/store/theme.store";

export function UserMenu() {
  const { theme, setTheme, isDark } = useTheme();
  const { data: currentUser } = useCurrentUserQuery();
  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleThemeToggle = () => {
    setTheme(isDark ? Theme.LIGHT : Theme.DARK);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const returnHref = buildRouteLocationHref(currentLocation);

    try {
      await logoutCurrentSession();
      await navigate(buildAuthRouteNavigation("/auth/login", returnHref));
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0"
          aria-label="Open user menu"
        >
          <Avatar
            src={currentUser?.avatar}
            name={currentUser?.name}
            className="h-8 w-8 border border-primary/20 bg-primary/10 text-primary"
            fallbackClassName="bg-primary/10 text-[11px] tracking-wide text-primary"
            loading="eager"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-70 w-56 max-h-[min(340px,calc(100vh-5rem))] overflow-y-auto rounded-2xl border-border p-0 shadow-xl shadow-black/10"
      >
        <DropdownMenuLabel className="px-4 py-3 border-b border-border font-normal">
          <p className="text-sm font-medium text-foreground truncate">
            {currentUser?.name ?? "Account details syncing"}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {currentUser?.email ?? "Your session is active"}
          </p>
        </DropdownMenuLabel>

        <div className="py-1.5">
          <DropdownMenuItem
            onSelect={handleThemeToggle}
            className="flex w-full cursor-pointer items-center gap-3 rounded-none px-4 py-2.5 text-sm text-foreground transition-colors duration-100 focus:bg-muted focus:text-foreground"
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
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-none px-4 py-2.5 text-sm text-foreground transition-colors duration-100 focus:bg-muted focus:text-foreground"
          >
            <Link
              {...buildProfileNavigation()}
              className="flex items-center gap-3"
            >
              <User
                size={15}
                aria-hidden="true"
                className="text-muted-foreground"
              />
              View Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-none px-4 py-2.5 text-sm text-foreground transition-colors duration-100 focus:bg-muted focus:text-foreground"
          >
            <Link
              {...buildSettingsNavigation()}
              className="flex items-center gap-3"
            >
              <Settings
                size={15}
                aria-hidden="true"
                className="text-muted-foreground"
              />
              Settings
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="mx-0 my-0 bg-border" />
        <div className="py-1.5">
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              void handleSignOut();
            }}
            disabled={isSigningOut}
            className="flex w-full cursor-pointer items-center gap-3 rounded-none px-4 py-2.5 text-sm text-destructive transition-colors duration-100 focus:bg-destructive/10 focus:text-destructive data-[disabled]:pointer-events-none data-[disabled]:opacity-60"
          >
            <LogOut size={15} aria-hidden="true" />
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
