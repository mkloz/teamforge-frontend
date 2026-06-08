import { memo } from "react";

import { Button } from "@/shared/components/ui/button";

export const NavButton = memo(
  ({
    onClick,
    label,
    icon,
  }: {
    onClick: (e: React.MouseEvent) => void;
    label: string;
    icon: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto size-12 rounded-full border border-white/10 bg-white/8 text-white/70 shadow-none backdrop-blur-md transition hover:scale-105 hover:bg-white/14 hover:text-white active:scale-95 sm:size-14"
    >
      {icon}
    </Button>
  ),
);
