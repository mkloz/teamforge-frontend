import type { LucideIcon } from "lucide-react";

interface MenuIconBadgeProps {
  icon: LucideIcon;
}

export function MenuIconBadge({ icon: Icon }: MenuIconBadgeProps) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg text-forge-teal">
      <Icon size={15} aria-hidden="true" />
    </span>
  );
}
