import type { LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function SelectionActionButton({
  danger = false,
  disabled = false,
  icon: Icon,
  label,
  onClick,
  title,
}: {
  danger?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant={danger ? "destructive" : "accentGhost"}
      size="xs"
      aria-label={label}
      className="shrink-0 disabled:opacity-45"
      contentClassName="gap-1.5"
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
