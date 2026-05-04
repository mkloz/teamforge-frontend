import { useId } from "react";

import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/lib/utils";

interface NotificationPreferenceRowProps {
  checked: boolean;
  title: string;
  description: string;
  onToggle: () => void;
  disabled: boolean;
}

export function NotificationPreferenceRow({
  checked,
  title,
  description,
  onToggle,
  disabled,
}: NotificationPreferenceRowProps) {
  const switchId = useId();

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-4 border-b border-border py-4 text-left transition-colors",
        checked && "border-forge-teal/20",
        disabled && "cursor-not-allowed opacity-70",
      )}
    >
      <div>
        <Label htmlFor={switchId} className="text-sm font-semibold text-ink">
          {title}
        </Label>
        <p className="mt-1 text-xs leading-relaxed text-slate-muted">
          {description}
        </p>
      </div>

      <Switch
        id={switchId}
        checked={checked}
        disabled={disabled}
        onCheckedChange={() => onToggle()}
        aria-label={title}
      />
    </div>
  );
}
