import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  LockKeyhole,
  LogOut,
  Moon,
  Settings,
  Shield,
  SlidersHorizontal,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { logoutCurrentSession } from "@/shared/api/auth-session-commands";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  buildAuthRouteNavigation,
  buildRouteLocationHref,
} from "@/shared/lib/auth-route";
import { cn } from "@/shared/lib/utils";
import { Theme, useTheme } from "@/shared/store/theme.store";

interface UserMenuProps {
  trigger?: "avatar" | "settings";
}

export function UserMenu({ trigger = "avatar" }: UserMenuProps) {
  const { theme, setTheme } = useTheme();
  const { data: currentUser } = useCurrentUserQuery();
  const currentLocation = useRouterState({
    select: (state) => state.location,
  });
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={trigger === "settings" ? "surface" : "ghost"}
          size="icon"
          className={cn(
            "shrink-0 rounded-full",
            trigger === "settings" && "size-10",
          )}
          aria-label="Open account drawer"
        >
          {trigger === "settings" ? (
            <Settings size={18} aria-hidden="true" />
          ) : (
            <Avatar
              src={currentUser?.avatar}
              name={currentUser?.name}
              className="h-8 w-8 border border-primary/20 bg-primary/10 text-primary"
              fallbackClassName="bg-primary/10 text-[11px] tracking-wide text-primary"
              loading="eager"
            />
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="z-70 flex w-full flex-col border-l border-border bg-canvas p-0 text-foreground shadow-xl shadow-black/15 sm:max-w-md [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:border [&>button]:border-border/70 [&>button]:bg-card/85 [&>button]:p-2 [&>button]:opacity-100"
      >
        <SheetHeader className="border-b border-border/70 px-5 py-5 pr-14 text-left">
          <SheetTitle className="text-xl font-black tracking-tight">
            Account
          </SheetTitle>
          <SheetDescription className="text-sm font-medium">
            Your profile, preferences, and session.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <section className="px-5 py-5">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                src={currentUser?.avatar}
                name={currentUser?.name}
                className="size-12 border border-forge-teal/20 bg-forge-teal/10 text-forge-teal shadow-sm"
                fallbackClassName="bg-forge-teal/10 text-sm tracking-wide text-forge-teal"
                loading="eager"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-black leading-tight text-foreground">
                  {currentUser?.name ?? "Account details syncing"}
                </p>
                <p className="mt-1 truncate text-sm font-medium text-muted-foreground">
                  {currentUser?.email ?? "Your session is active"}
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-between gap-3 border-y border-border/70 px-5 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center text-forge-teal">
                {theme === Theme.DARK ? (
                  <Moon size={16} aria-hidden="true" />
                ) : (
                  <Sun size={16} aria-hidden="true" />
                )}
              </span>
              <p className="truncate text-sm font-black text-foreground">
                Theme
              </p>
            </div>

            <div className="grid w-36 shrink-0 grid-cols-2 gap-1 rounded-full border border-border/70 bg-card p-1">
              <AppearanceOption
                icon={Sun}
                isActive={theme === Theme.LIGHT}
                label="Light"
                onClick={() => setTheme(Theme.LIGHT)}
              />
              <AppearanceOption
                icon={Moon}
                isActive={theme === Theme.DARK}
                label="Dark"
                onClick={() => setTheme(Theme.DARK)}
              />
            </div>
          </section>

          <section className="flex flex-col gap-1 px-5 py-4">
            <SheetClose asChild>
              <Link
                {...buildProfileNavigation()}
                className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-foreground transition-[background-color,color] duration-150 hover:bg-muted/55"
              >
                <MenuIconBadge icon={UserRound} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">
                    Profile
                  </span>
                  <span className="block truncate text-xs font-medium text-muted-foreground">
                    Public view
                  </span>
                </span>
                <ChevronRight
                  size={15}
                  className="shrink-0 text-muted-foreground/70"
                  aria-hidden="true"
                />
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                {...buildSettingsNavigation()}
                className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-foreground transition-[background-color,color] duration-150 hover:bg-muted/55"
              >
                <MenuIconBadge icon={Settings} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">
                    Settings
                  </span>
                  <span className="block truncate text-xs font-medium text-muted-foreground">
                    All preferences
                  </span>
                </span>
                <ChevronRight
                  size={15}
                  className="shrink-0 text-muted-foreground/70"
                  aria-hidden="true"
                />
              </Link>
            </SheetClose>
          </section>

          <section className="border-t border-border/70 px-5 py-4">
            <h3 className="text-sm font-black text-foreground">Settings</h3>
            <div className="mt-2 flex flex-col gap-1">
              <MenuLinkItem
                icon={SlidersHorizontal}
                label="Group fit"
                description="Interests and forming rules"
                navigation={buildSettingsNavigation("matching")}
              />
              <MenuLinkItem
                icon={Shield}
                label="Privacy and safety"
                description="Visibility and blocked people"
                navigation={buildSettingsNavigation("privacy")}
              />
              <MenuLinkItem
                icon={LockKeyhole}
                label="Security"
                description="Sessions and recovery"
                navigation={buildSettingsNavigation("security")}
              />
              <MenuLinkItem
                icon={Bell}
                label="Notifications"
                description="App and email updates"
                navigation={buildSettingsNavigation("notifications")}
              />
            </div>
          </section>

          <div className="mt-auto border-t border-border/70 p-5">
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-destructive transition-[background-color,color] duration-150 hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <LogOut size={16} aria-hidden="true" />
              </span>
              <span className="font-black">
                {isSigningOut ? "Signing out..." : "Sign out"}
              </span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface AppearanceOptionProps {
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function AppearanceOption({
  icon: Icon,
  isActive,
  label,
  onClick,
}: AppearanceOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        "flex h-7 items-center justify-center gap-1.5 rounded-full text-xs font-black transition-[background-color,color,box-shadow] duration-150",
        isActive
          ? "bg-forge-teal text-white shadow-sm shadow-forge-teal/20"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <Icon size={13} aria-hidden="true" />
      {label}
    </button>
  );
}

interface MenuIconBadgeProps {
  icon: LucideIcon;
}

function MenuIconBadge({ icon: Icon }: MenuIconBadgeProps) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-forge-teal">
      <Icon size={15} aria-hidden="true" />
    </span>
  );
}

interface MenuLinkItemProps {
  description: string;
  icon: LucideIcon;
  label: string;
  navigation: ReturnType<typeof buildSettingsNavigation>;
}

function MenuLinkItem({
  description,
  icon,
  label,
  navigation,
}: MenuLinkItemProps) {
  return (
    <SheetClose asChild>
      <Link
        {...navigation}
        className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-foreground transition-[background-color,color] duration-150 hover:bg-muted/55"
      >
        <MenuIconBadge icon={icon} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black">{label}</span>
          <span className="block truncate text-xs font-medium text-muted-foreground">
            {description}
          </span>
        </span>
        <ChevronRight
          size={15}
          className="shrink-0 text-muted-foreground/70"
          aria-hidden="true"
        />
      </Link>
    </SheetClose>
  );
}
