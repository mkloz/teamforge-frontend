import { Check } from "lucide-react";

import type { Visibility } from "@/features/plan-creation/lib/plan-creation-contract";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { cn } from "@/shared/lib/utils";

import { VISIBILITY_OPTIONS } from "./step3-group.constants";

interface PrivacySectionProps {
  visibility: Visibility;
  onVisibilityChange: (v: Visibility) => void;
}

type VisibilityOption = (typeof VISIBILITY_OPTIONS)[number];

export function PrivacySection({
  visibility,
  onVisibilityChange,
}: PrivacySectionProps) {
  return (
    <fieldset>
      <legend className="px-0.5 font-black text-foreground text-lg leading-tight tracking-tight">
        Visibility
      </legend>

      <p className="mt-1 mb-3 px-0.5 text-muted-foreground text-sm">
        Choose who can discover this group.
      </p>

      <GroupedMenuList>
        {VISIBILITY_OPTIONS.map((option) => (
          <GroupedMenuItem key={option.value}>
            <VisibilityOptionButton
              active={visibility === option.value}
              option={option}
              onVisibilityChange={onVisibilityChange}
            />
          </GroupedMenuItem>
        ))}
      </GroupedMenuList>
    </fieldset>
  );
}

function VisibilityOptionButton({
  active,
  option,
  onVisibilityChange,
}: {
  active: boolean;
  option: VisibilityOption;
  onVisibilityChange: PrivacySectionProps["onVisibilityChange"];
}) {
  const { value, label, description, Icon } = option;

  return (
    <GroupedMenuAction selected={active} className="min-h-16 px-4 py-3">
      <label className="flex w-full cursor-pointer items-center gap-3">
        <input
          type="radio"
          name="plan-creation-visibility"
          value={value}
          checked={active}
          onChange={() => onVisibilityChange(value)}
          className="sr-only"
        />
        <Icon
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 transition-colors",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-foreground text-sm leading-tight">
            {label}
          </span>
          <span className="mt-1 block text-pretty text-muted-foreground text-xs leading-snug">
            {description}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full border transition-colors",
            active
              ? "border-brand-teal bg-brand-teal text-white"
              : "border-border/60 text-transparent",
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      </label>
    </GroupedMenuAction>
  );
}
