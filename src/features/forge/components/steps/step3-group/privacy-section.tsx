import type { Visibility } from "@/features/forge/lib/forge-contract";
import { IconTile } from "@/shared/components/ui/icon-tile";
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
    <fieldset className="grid gap-3 border-border/25 border-t pt-4">
      <legend className="px-0.5 font-semibold text-foreground text-sm leading-tight">
        Visibility
      </legend>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {VISIBILITY_OPTIONS.map((option) => (
          <VisibilityOptionButton
            key={option.value}
            active={visibility === option.value}
            option={option}
            onVisibilityChange={onVisibilityChange}
          />
        ))}
      </div>
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
    <label className={getVisibilityOptionClassName(active)}>
      <input
        type="radio"
        name="forge-visibility"
        value={value}
        checked={active}
        onChange={() => onVisibilityChange(value)}
        className="sr-only"
      />
      <span className="flex min-w-0 items-start justify-start gap-3 whitespace-normal sm:grid sm:w-full sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3 sm:gap-y-0">
        <IconTile
          icon={Icon}
          size="xs"
          tone={active ? "teal" : "neutral"}
          className={getVisibilityOptionIconClassName(active)}
        />
        <span className="min-w-0 flex-1 gap-1 sm:contents">
          <span className={getVisibilityOptionLabelClassName(active)}>
            {label}
          </span>
          <span className="min-w-0 text-pretty text-muted-foreground text-xs leading-snug sm:col-span-3 sm:col-start-1 sm:row-start-2 sm:pt-2">
            {description}
          </span>
        </span>
      </span>
    </label>
  );
}

function getVisibilityOptionClassName(active: boolean) {
  return cn(
    "group relative flex h-auto w-full min-w-0 cursor-pointer items-start justify-start whitespace-normal rounded-lg border p-3 text-left transition-colors duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/45 focus-within:ring-offset-2 focus-within:ring-offset-background",
    active
      ? "border-forge-teal/55 bg-forge-teal/10 shadow-sm ring-1 ring-forge-teal/20"
      : "border-border/40 bg-card hover:border-forge-teal/30 hover:bg-forge-teal/5",
  );
}

function getVisibilityOptionIconClassName(active: boolean) {
  return cn(
    "sm:col-start-1 sm:row-start-1",
    active
      ? "bg-forge-teal text-white shadow-forge-teal/25 shadow-sm"
      : "bg-muted group-hover:bg-forge-teal/10 group-hover:text-forge-teal",
  );
}

function getVisibilityOptionLabelClassName(active: boolean) {
  return cn(
    "min-w-0 text-pretty font-semibold text-sm leading-5 sm:col-start-2 sm:row-start-1 sm:self-center",
    active ? "text-forge-teal" : "text-foreground",
  );
}
