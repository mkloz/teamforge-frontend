import type { LucideIcon } from "lucide-react";
import { IconTile } from "@/shared/components/ui/icon-tile";

interface MenuIconBadgeProps {
  icon: LucideIcon;
}

export function MenuIconBadge({ icon: Icon }: MenuIconBadgeProps) {
  return (
    <IconTile icon={Icon} size="md" tone="none" className="text-forge-teal" />
  );
}
