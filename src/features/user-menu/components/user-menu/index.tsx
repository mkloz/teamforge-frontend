import { Link } from "@tanstack/react-router";
import {
  Bell,
  LockKeyhole,
  Settings,
  Shield,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
import { buildSettingsNavigation } from "@/shared/navigation/settings-navigation";
import type { User } from "@/shared/schemas";

import { AppearanceSwitch } from "./appearance-switch";
import { MenuLinkItem, MenuLinkItemContent } from "./menu-link-item";
import { UserMenuProfileSummary } from "./profile-summary";
import { UserMenuSignOutButton } from "./sign-out-button";
import { type UserMenuTrigger, UserMenuTriggerButton } from "./trigger-button";

interface UserMenuProps {
  trigger?: UserMenuTrigger;
}

export function UserMenu({ trigger = "avatar" }: UserMenuProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const profileLink = getUserMenuProfileLink(currentUser);

  return (
    <Sheet>
      <Tooltip>
        <SheetTrigger asChild>
          <TooltipTrigger asChild>
            <UserMenuTriggerButton trigger={trigger} />
          </TooltipTrigger>
        </SheetTrigger>
        <TooltipContent>Account</TooltipContent>
      </Tooltip>

      <SheetContent
        side="right"
        className="z-70 flex w-full flex-col border-border border-l bg-canvas p-0 text-foreground shadow-black/15 shadow-xl sm:max-w-sm [&>button]:top-5 [&>button]:right-5 [&>button]:rounded-full [&>button]:border [&>button]:border-border/70 [&>button]:bg-card/85 [&>button]:p-2 [&>button]:opacity-100"
      >
        {/* Header */}
        <SheetHeader className="border-border/70 border-b px-5 py-4 pr-14 text-left">
          <SheetTitle className="font-black text-xl tracking-tight">
            Account
          </SheetTitle>
          <SheetDescription className="font-medium text-sm">
            Your profile, preferences, and session.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Profile card */}
          <UserMenuProfileSummary />

          {/* Theme toggle */}
          <div className="px-4 pb-2">
            <AppearanceSwitch />
          </div>

          {/* Divider */}
          <div className="mx-4 border-border/50 border-t" />

          {/* Primary nav */}
          <nav className="flex flex-col gap-0.5 px-4 py-2">
            <SheetClose asChild>
              <Link
                {...profileLink.navigation}
                className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-foreground transition-colors duration-150 hover:bg-muted/55"
                aria-label={profileLink.ariaLabel}
              >
                <MenuLinkItemContent
                  icon={UserRound}
                  label={profileLink.label}
                  description={profileLink.description}
                />
              </Link>
            </SheetClose>

            <MenuLinkItem
              icon={Settings}
              label="Settings"
              description="All preferences"
              navigation={buildSettingsNavigation()}
            />
          </nav>

          {/* Divider */}
          <div className="mx-4 border-border/50 border-t" />

          {/* Settings sub-nav */}
          <nav className="flex flex-col gap-0.5 px-4 py-2">
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
          </nav>

          {/* Sign out */}
          <div className="mt-auto border-border/50 border-t px-4 py-3">
            <UserMenuSignOutButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getUserMenuProfileLink(currentUser: User | undefined) {
  if (currentUser?.id) {
    return {
      navigation: buildProfileNavigation(currentUser.id),
      label: "View public profile",
      description: "How others see you",
      ariaLabel: "View your public profile",
    };
  }

  return {
    navigation: buildProfileNavigation(),
    label: "Profile",
    description: "Your profile",
    ariaLabel: "Open your profile",
  };
}
