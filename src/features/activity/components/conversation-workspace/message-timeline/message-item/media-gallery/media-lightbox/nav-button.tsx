import type { MouseEvent, ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";

export function NavButton({
  onClick,
  label,
  icon,
}: {
  onClick: (event: MouseEvent) => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto size-12 rounded-full border border-white/10 bg-white/8 text-white/70 shadow-none backdrop-blur-md transition hover:scale-105 hover:bg-white/14 hover:text-white active:scale-95 sm:size-14"
    >
      {icon}
    </Button>
  );
}
