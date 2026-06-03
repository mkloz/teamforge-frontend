import type { ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";
export interface GroupActionButtonProps {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  title?: string;
  variant?: "default" | "destructive" | "muted";
}

export function GroupActionButton({
  disabled = false,
  icon,
  label,
  onClick,
  title,
  variant = "default",
}: GroupActionButtonProps) {
  const buttonVariant =
    variant === "destructive"
      ? "destructive"
      : variant === "muted"
        ? "accentGhost"
        : "subtle";

  return (
    <Button
      variant={buttonVariant}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className="h-auto w-full justify-start px-3 py-3 text-left"
    >
      <span className="shrink-0">{icon}</span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </Button>
  );
}
