import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";

import type { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { SheetClose } from "@/shared/components/ui/sheet";

import { MenuIconBadge } from "./menu-icon-badge";

interface MenuLinkItemProps {
  description: string;
  icon: LucideIcon;
  label: string;
  navigation: ReturnType<typeof buildSettingsNavigation>;
}

export function MenuLinkItem({
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
        <MenuLinkItemContent
          icon={icon}
          label={label}
          description={description}
        />
      </Link>
    </SheetClose>
  );
}

interface MenuLinkItemContentProps {
  description: string;
  icon: LucideIcon;
  label: string;
}

export function MenuLinkItemContent({
  description,
  icon,
  label,
}: MenuLinkItemContentProps) {
  return (
    <>
      <MenuIconBadge icon={icon} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-black text-sm">{label}</span>
        <span className="block truncate font-medium text-muted-foreground text-xs">
          {description}
        </span>
      </span>
      <ChevronRight
        size={15}
        className="shrink-0 text-muted-foreground/70"
        aria-hidden="true"
      />
    </>
  );
}
