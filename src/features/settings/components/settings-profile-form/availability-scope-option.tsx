import type { LucideIcon } from "lucide-react";
import { useId } from "react";

import { GroupedMenuAction } from "@/shared/components/ui/grouped-menu";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";

interface AvailabilityScopeOptionProps {
  checked: boolean;
  disabled: boolean;
  icon: LucideIcon;
  onToggle: () => void;
  title: string;
}

export function AvailabilityScopeOption({
  checked,
  disabled,
  icon: Icon,
  onToggle,
  title,
}: AvailabilityScopeOptionProps) {
  const switchId = useId();

  return (
    <GroupedMenuAction
      selected={checked}
      className={cn(
        "min-h-12 gap-3 px-3 py-2 sm:min-h-14 sm:gap-4 sm:px-4 sm:py-3",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <Label
        htmlFor={switchId}
        className={cn(
          "min-w-0 flex-1 flex-row items-center gap-2 leading-normal",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            checked ? "text-foreground" : "text-slate-muted",
          )}
          aria-hidden="true"
        />
        <span className="block font-bold text-ink text-sm">{title}</span>
      </Label>

      <Switch
        id={switchId}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onToggle}
        aria-label={title}
        className="shrink-0"
      />
    </GroupedMenuAction>
  );
}
