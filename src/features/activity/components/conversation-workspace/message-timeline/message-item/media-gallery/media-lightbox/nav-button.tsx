import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";

export function NavButton({
  disabled,
  onClick,
  label,
  icon,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="pointer-events-auto size-11 rounded-full border border-white/15 bg-black/45 text-white shadow-none backdrop-blur-md hover:bg-black/65 disabled:opacity-35"
    >
      {icon}
    </Button>
  );
}
