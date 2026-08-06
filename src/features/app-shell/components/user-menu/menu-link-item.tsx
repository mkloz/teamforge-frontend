import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  GroupedMenuAction,
  GroupedMenuItem,
} from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { SheetClose } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";
import type { buildAdminNavigation } from "@/shared/navigation/admin-navigation";
import type { buildOnboardingPracticeNavigation } from "@/shared/navigation/onboarding-practice-navigation";
import type { buildSafetyNavigation } from "@/shared/navigation/safety-navigation";
import type { buildSettingsNavigation } from "@/shared/navigation/settings-navigation";

interface MenuLinkItemProps {
  icon: LucideIcon;
  description?: string;
  label: string;
  navigation:
    | ReturnType<typeof buildAdminNavigation>
    | ReturnType<typeof buildOnboardingPracticeNavigation>
    | ReturnType<typeof buildSafetyNavigation>
    | ReturnType<typeof buildSettingsNavigation>;
  tone?: "default" | "destructive";
}

export function MenuLinkItem({
  icon,
  description,
  label,
  navigation,
  tone = "default",
}: MenuLinkItemProps) {
  return (
    <GroupedMenuItem>
      <GroupedMenuAction asChild>
        <SheetClose asChild>
          <Link
            {...navigation}
            className={cn(
              "min-h-14 px-4 py-2.5",
              tone === "destructive" &&
                "text-destructive hover:bg-destructive/8",
            )}
          >
            <MenuLinkItemContent
              description={description}
              icon={icon}
              label={label}
              tone={tone}
            />
          </Link>
        </SheetClose>
      </GroupedMenuAction>
    </GroupedMenuItem>
  );
}

interface MenuLinkItemContentProps {
  description?: string;
  icon: LucideIcon;
  label: string;
  tone?: "default" | "destructive";
}

export function MenuLinkItemContent({
  description,
  icon,
  label,
  tone = "default",
}: MenuLinkItemContentProps) {
  return (
    <>
      <IconTile
        icon={icon}
        tone={tone === "destructive" ? "destructive" : "teal"}
        size="md"
        className="bg-transparent"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-sm">{label}</span>
        {description ? (
          <span className="mt-0.5 block truncate text-muted-foreground text-xs">
            {description}
          </span>
        ) : null}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
        strokeWidth={2}
        aria-hidden="true"
      />
    </>
  );
}
