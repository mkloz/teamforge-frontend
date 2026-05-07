import { memo } from "react";

import { Button } from "@/shared/components/ui/button";

export const NavButton = memo(
  ({
    onClick,
    icon,
  }: {
    onClick: (e: React.MouseEvent) => void;
    icon: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="pointer-events-auto size-12 rounded-xl border border-white/10 bg-white/5 text-white/50 backdrop-blur-md transition hover:scale-105 hover:bg-white/10 hover:text-white sm:size-14"
    >
      {icon}
    </Button>
  ),
);
