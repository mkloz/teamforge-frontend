import { useId } from "react";

import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";

interface PlanDecisionToggleProps {
  checked: boolean;
  checkedDescription: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
  uncheckedDescription: string;
}

export function PlanDecisionToggle({
  checked,
  checkedDescription,
  label,
  onCheckedChange,
  uncheckedDescription,
}: PlanDecisionToggleProps) {
  const switchId = useId();
  const descriptionId = `${switchId}-description`;

  return (
    <div className="flex min-h-16 items-center justify-between gap-4 border-border/30 border-b py-3">
      <div className="min-w-0">
        <Label
          className="w-fit cursor-pointer font-semibold text-foreground"
          htmlFor={switchId}
        >
          {label}
        </Label>
        <p
          className="mt-1 text-muted-foreground text-xs leading-relaxed"
          id={descriptionId}
        >
          {checked ? checkedDescription : uncheckedDescription}
        </p>
      </div>
      <Switch
        aria-describedby={descriptionId}
        checked={checked}
        id={switchId}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
