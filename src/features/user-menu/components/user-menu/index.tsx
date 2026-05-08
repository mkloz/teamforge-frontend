import { Link } from "@tanstack/react-router";
import {
  Bell,
  LockKeyhole,
  Settings,
  Shield,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

import { AppearanceSwitch } from "./appearance-switch";
import { MenuLinkItem, MenuLinkItemContent } from "./menu-link-item";
import { UserMenuProfileSummary } from "./profile-summary";
import { UserMenuSignOutButton } from "./sign-out-button";
import { type UserMenuTrigger, UserMenuTriggerButton } from "./trigger-button";

interface UserMenuProps {
  trigger?: UserMenuTrigger;
}

export function UserMenu({ trigger = "avatar" }: UserMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <UserMenuTriggerButton trigger={trigger} />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="z-70 flex w-full flex-col border-border border-l bg-canvas p-0 text-foreground shadow-black/15 shadow-xl sm:max-w-md [&>button]:top-5 [&>button]:right-5 [&>button]:rounded-full [&>button]:border [&>button]:border-border/70 [&>button]:bg-card/85 [&>button]:p-2 [&>button]:opacity-100"
      >
        <SheetHeader className="border-border/70 border-b px-5 py-5 pr-14 text-left">
          <SheetTitle className="font-black text-xl tracking-tight">
            Account
          </SheetTitle>
          <SheetDescription className="font-medium text-sm">
            Your profile, preferences, and session.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <UserMenuProfileSummary />
          <AppearanceSwitch />

          <section className="flex flex-col gap-1 px-5 py-4">
            <SheetClose asChild>
              <Link
                {...buildProfileNavigation()}
                className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-foreground transition-[background-color,color] duration-150 hover:bg-muted/55"
              >
                <MenuLinkItemContent
                  icon={UserRound}
                  label="Profile"
                  description="Public view"
                />
              </Link>
            </SheetClose>

            <MenuLinkItem
              icon={Settings}
              label="Settings"
              description="All preferences"
              navigation={buildSettingsNavigation()}
            />
          </section>

          <section className="border-border/70 border-t px-5 py-4">
            <h3 className="font-black text-foreground text-sm">Settings</h3>
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

          <div className="mt-auto border-border/70 border-t p-5">
            <UserMenuSignOutButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
