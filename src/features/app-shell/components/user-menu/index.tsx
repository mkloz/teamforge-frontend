import {
  Bell,
  Compass,
  Eye,
  LockKeyhole,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { useOnboardingProductStateQuery } from "@/shared/api/onboarding-product-state-query";
import {
  GroupedMenuList,
  GroupedMenuSection,
} from "@/shared/components/ui/grouped-menu";
import {
  Sheet,
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
import { buildAdminNavigation } from "@/shared/navigation/admin-navigation";
import { buildOnboardingPracticeNavigation } from "@/shared/navigation/onboarding-practice-navigation";
import { buildSafetyNavigation } from "@/shared/navigation/safety-navigation";
import { buildSettingsNavigation } from "@/shared/navigation/settings-navigation";

import { AppearanceSwitch } from "./appearance-switch";
import { MenuLinkItem } from "./menu-link-item";
import { UserMenuProfileSummary } from "./profile-summary";
import { UserMenuSignOutButton } from "./sign-out-button";
import { TeamForgeLinks } from "./teamforge-links";
import { type UserMenuTrigger, UserMenuTriggerButton } from "./trigger-button";

interface UserMenuProps {
  trigger?: UserMenuTrigger;
}

export function UserMenu({ trigger = "avatar" }: UserMenuProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const { data: productState } = useOnboardingProductStateQuery();
  const practiceAllowed =
    productState?.capabilities.USE_ONBOARDING_PRACTICE.allowed === true;

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
        overlayClassName="z-110"
        className="z-110 flex w-full flex-col border-border border-l bg-background p-0 text-foreground shadow-black/15 shadow-xl sm:max-w-108 [&>button]:top-5 [&>button]:right-5 [&>button]:z-20 [&>button]:rounded-full [&>button]:border [&>button]:border-border/70 [&>button]:bg-card [&>button]:p-2 [&>button]:text-foreground [&>button]:opacity-100"
      >
        <SheetHeader className="sticky top-0 z-10 bg-background/95 px-5 pt-5 pr-14 pb-3 text-left backdrop-blur-sm">
          <SheetTitle className="font-black text-xl tracking-tight">
            Account
          </SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm">
            Your profile, preferences and privacy.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <UserMenuProfileSummary />

          <div className="px-4 pb-6">
            <AppearanceSwitch />
          </div>

          <div className="space-y-6 px-4 pb-6">
            <GroupedMenuSection label="Preferences">
              <GroupedMenuList>
                <MenuLinkItem
                  description="Matching, availability and invitations"
                  icon={SlidersHorizontal}
                  label="Group preferences"
                  navigation={buildSettingsNavigation("matching")}
                />
                <MenuLinkItem
                  description="Choose what reaches you"
                  icon={Bell}
                  label="Notifications"
                  navigation={buildSettingsNavigation("notifications")}
                />
              </GroupedMenuList>
            </GroupedMenuSection>

            <GroupedMenuSection label="Privacy and protection">
              <GroupedMenuList>
                <MenuLinkItem
                  description="Control what people can see"
                  icon={Eye}
                  label="Privacy"
                  navigation={buildSettingsNavigation("privacy")}
                />
                <MenuLinkItem
                  description="Sessions and account protection"
                  icon={LockKeyhole}
                  label="Security"
                  navigation={buildSettingsNavigation("security")}
                />
                <MenuLinkItem
                  description="Blocks, reports and restrictions"
                  icon={Shield}
                  label="Safety"
                  navigation={buildSafetyNavigation()}
                />
              </GroupedMenuList>
            </GroupedMenuSection>

            {practiceAllowed ? (
              <GroupedMenuSection label="Help and learning">
                <GroupedMenuList>
                  <MenuLinkItem
                    description="Replay three short contextual hints"
                    icon={Compass}
                    label="Replay navigation hints"
                    navigation={buildOnboardingPracticeNavigation("/home")}
                  />
                </GroupedMenuList>
              </GroupedMenuSection>
            ) : null}

            {currentUser?.role === "ADMIN" ? (
              <GroupedMenuSection label="TeamForge management">
                <GroupedMenuList>
                  <MenuLinkItem
                    description="Operations and moderation"
                    icon={ShieldCheck}
                    label="Admin"
                    navigation={buildAdminNavigation()}
                  />
                </GroupedMenuList>
              </GroupedMenuSection>
            ) : null}
          </div>

          <div className="mt-auto">
            <TeamForgeLinks />

            <div className="border-border/50 border-t px-4 py-4">
              <UserMenuSignOutButton />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
