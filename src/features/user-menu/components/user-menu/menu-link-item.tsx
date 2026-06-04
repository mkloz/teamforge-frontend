import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import type { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { SheetClose } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

interface MenuLinkItemProps {
  description?: string;
  icon: LucideIcon;
  label: string;
  navigation: ReturnType<typeof buildSettingsNavigation>;
  tone?: "default" | "destructive";
}

export function MenuLinkItem({
  description,
  icon,
  label,
  navigation,
  tone = "default",
}: MenuLinkItemProps) {
  return (
    <SheetClose asChild>
      <Link
        {...navigation}
        className={cn(
          "flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-150",
          tone === "destructive"
            ? "text-destructive hover:bg-destructive/8"
            : "text-foreground hover:bg-muted/55",
        )}
      >
        <MenuLinkItemContent
          icon={icon}
          label={label}
          description={description}
          tone={tone}
        />
      </Link>
    </SheetClose>
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
        bordered
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-sm">{label}</span>
        {description && (
          <span className="block truncate text-muted-foreground text-xs">
            {description}
          </span>
        )}
      </span>
    </>
  );
}
